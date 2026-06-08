import React, { useState, useEffect } from 'react';
import { FirestoreService } from '../services/firestoreService';
import NavBar from '../components/NavBar';

const SKILLS_MAP = ['DELIVERY', 'WAREHOUSING', 'RETAIL', 'SECURITY', 'DRIVING', 'DATA_ENTRY'];

const StarRating = ({ rating = 5, size = 12 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? '#FBBF24' : 'var(--border)' }}>★</span>
    ))}
  </div>
);

const WorkerApplicationsScreen = ({ setActive, user, t = {} }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [payNotif, setPayNotif] = useState(null);
  const [disputeId, setDisputeId] = useState(null);
  const [disputeText, setDisputeText] = useState('');
  const [workerRatings, setWorkerRatings] = useState({});
  const [loadedProfiles, setLoadedProfiles] = useState({});

  const toggleExpand = async (app) => {
    const isExpanding = expandedId !== app.id;
    setExpandedId(isExpanding ? app.id : null);
    
    if (isExpanding && !loadedProfiles[app.workerId]) {
      try {
        const profile = await FirestoreService.getUserProfile(app.workerId);
        if (profile) {
          setLoadedProfiles(prev => ({
            ...prev,
            [app.workerId]: profile
          }));
        }
      } catch (err) {
        console.error("Failed to load worker profile:", err);
      }
    }
  };

  useEffect(() => {
    const workerId = user?.uid || user?.id;
    if (workerId) {
      try {
        const raw = localStorage.getItem(`notif_${workerId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          setPayNotif(prev => {
            if (prev && prev.id === parsed.id && prev.amount === parsed.amount && prev.status === parsed.status) {
              return prev;
            }
            return parsed;
          });
        }
      } catch(e) {}
    }
    const unsubscribe = FirestoreService.streamApplications(
      (data) => {
        const all = (data ?? []).filter(app => !workerId || app.workerId === workerId);
        const enriched = all.map(app => ({
          ...app,
          phone: app.phone || '+91 98765 43210',
          rating: app.rating || 4.7,
          exp: app.exp || 'Experienced',
          completedJobs: app.completedJobs || 12,
          skills: app.skills || SKILLS_MAP.slice(0, 3),
          distance: app.distance || '2.4 km away',
          trustScore: app.trustScore || 82
        }));
        setApplications(prev => {
          if (prev.length === enriched.length && prev.every((v, i) => v.id === enriched[i].id && v.status === enriched[i].status)) {
            return prev;
          }
          return enriched;
        });
        setLoading(prev => prev === false ? prev : false);
      },
      (err) => {
        console.error('WorkerApplicationsScreen Stream Error:', err);
        setLoading(prev => prev === false ? prev : false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const handleAction = async (app, action) => {
    setError(null);
    try {
      const status = action === 'approve' ? 'Approved' : 'Rejected';
      await FirestoreService.updateApplicationStatus(app.id, status);
      setSuccessId(app.id);
      setTimeout(() => {
        setApplications(prev => prev.filter(a => a.id !== app.id));
        setSuccessId(null);
      }, 1500);
      if (action === 'approve') {
        await FirestoreService.initializeTasks(app.id, app.category || 'General');
      }
    } catch (err) {
      console.error('Error updating application status:', err);
      setError(t.error_failed_update_status || 'Failed to update status. Please try again.');
    }
  };

  const handleApproveAll = async () => {
    HapticService.lightTap();
    const pendingApps = applications.filter(app => app.status === 'Pending');
    if (pendingApps.length === 0) return;
    
    try {
      await Promise.all(pendingApps.map(async (app) => {
        await FirestoreService.updateApplicationStatus(app.id, 'Approved');
        await FirestoreService.initializeTasks(app.id, app.category || 'General');
      }));
      setApplications(prev => prev.filter(a => a.status !== 'Pending'));
    } catch (err) {
      console.error('Error approving all applications:', err);
      setError('Failed to approve all. Please try again.');
    }
  };

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header Container */}
      <div style={{ 
        padding: 'var(--header-pad) 20px 16px', 
        flexShrink: 0, 
        zIndex: 10,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            onClick={() => setActive('Home')}
            className="tap-effect"
            style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text-primary)', fontWeight: 700, background: 'var(--bg-subtle)' }}>
            ←
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t.applicants || 'Applicants'}</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, marginTop: 2 }}>{t.review_applications || 'Review and recruit candidates'}</div>
          </div>
        </div>
        
        {applications.some(a => a.status === 'Pending') && (
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={handleApproveAll}
              className="cred-pill-action" 
              style={{ padding: '8px 14px', borderRadius: 20, background: '#16A34A', color: 'white', border: 'none', fontWeight: 700, fontSize: 12, boxShadow: '0 4px 10px rgba(22, 163, 74, 0.2)' }}
            >
              Approve All Pending
            </button>
          </div>
        )}
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '20px 16px', background: 'var(--bg)' }}>
        {payNotif && (
          <div className="cred-alert-strip" style={{ marginBottom: 20 }}>
            <span>💸</span>
            <div style={{ flex: 1, fontSize: 11, fontWeight: 600 }}>{payNotif.message}</div>
            <div onClick={() => { setPayNotif(null); try { localStorage.removeItem(`notif_${user?.uid || user?.id}`); } catch(e) {} }} style={{ cursor: 'pointer', fontWeight: 700, paddingLeft: 6 }}>✕</div>
          </div>
        )}
        {error && (
          <div className="cred-alert-strip" style={{ marginBottom: 20, background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#E8302A' }}>
            <span>⚠️</span>
            <div style={{ fontSize: 11, fontWeight: 600 }}>{error}</div>
          </div>
        )}

        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 150, borderRadius: 16, marginBottom: 16 }} />)
        ) : applications.length > 0 ? (
          applications.map(app => (
            <div
              key={app.id}
              className="cred-card"
              style={{
                marginBottom: 16,
                padding: '20px',
                border: successId === app.id ? '1.5px solid #16A34A' : '1px solid var(--border)',
                background: successId === app.id ? '#DCFCE7' : '#FFFFFF',
              }}>

              <div 
                onClick={() => toggleExpand(app)}
                style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16, cursor: 'pointer' }}
                title="Click to view candidate details"
              >
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {app.img || '👤'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 700 }}>
                    <bdi>{app.name || app.workerName || 'Anonymous'}</bdi>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <StarRating rating={app.rating || 5} size={12} />
                    <span style={{ color: 'var(--text-primary)', fontSize: 11, fontWeight: 700 }}>{app.rating || '5.0'}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}>• {app.completedJobs || 0} gigs</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '6px 10px', borderRadius: 8, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 700 }}>
                    {app.trustScore || 80}
                  </div>
                  <div style={{ fontSize: 8, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 1 }}>TRUST</div>
                </div>
              </div>

              {/* Call / Contact row */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <a
                  href={`tel:${app.phone || '+919876543210'}`}
                  className="cred-pill-action"
                  style={{ flex: 1, padding: '8px 12px', justifyContent: 'center', textDecoration: 'none' }}>
                  <span className="cred-pill-action-label" style={{ fontSize: 12 }}>📞 {t.call || 'Call'}</span>
                </a>
                <a
                  href={`https://wa.me/${(app.phone || '+919876543210').replace(/\s|\+/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="cred-pill-action"
                  style={{ flex: 1.2, padding: '8px 12px', justifyContent: 'center', textDecoration: 'none' }}>
                  <span className="cred-pill-action-label" style={{ fontSize: 12 }}>💬 WhatsApp</span>
                </a>
                <button
                  onClick={() => toggleExpand(app)}
                  className="cred-pill-action"
                  style={{ width: 44, padding: 0, justifyContent: 'center' }}>
                  <span className="cred-pill-action-label" style={{ fontSize: 10 }}>{expandedId === app.id ? '▲' : '▼'}</span>
                </button>
              </div>

              {expandedId === app.id && (
                <div className="fade-in" style={{
                  marginBottom: 16,
                  padding: '16px',
                  background: 'var(--bg-subtle)',
                  borderRadius: 12,
                  border: '1px dashed var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  {/* Stats & Proximity Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ padding: '8px 10px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8 }}>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Proximity</div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700, marginTop: 2 }}>{app.distance}</div>
                    </div>
                    <div style={{ padding: '8px 10px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8 }}>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.experience || 'Experience'}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700, marginTop: 2 }}>
                        {loadedProfiles[app.workerId]?.experience || app.exp}
                      </div>
                    </div>
                  </div>

                  {/* Personal details row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ padding: '8px 10px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8 }}>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.dob || 'Date of Birth'}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700, marginTop: 2 }}>
                        {loadedProfiles[app.workerId]?.dob || '—'}
                      </div>
                    </div>
                    <div style={{ padding: '8px 10px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8 }}>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.gender || 'Gender'}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700, marginTop: 2 }}>
                        {loadedProfiles[app.workerId]?.gender || '—'}
                      </div>
                    </div>
                  </div>

                  {/* Preferred Locations */}
                  <div style={{ padding: '8px 10px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8 }}>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.preferred_areas || 'Preferred Locations'}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700, marginTop: 2 }}>
                      {loadedProfiles[app.workerId]?.preferredAreas || '—'}
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Skills Matrix</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(loadedProfiles[app.workerId]?.skills || app.skills || ['General Labor']).map(s => (
                        <span key={s} className="cred-badge cred-badge-gray" style={{ border: '1px solid var(--border)', fontSize: 10, padding: '4px 8px', borderRadius: 6 }}>
                          <bdi>{s.replace(/_/g, ' ')}</bdi>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {successId === app.id ? (
                <div style={{ textAlign: 'center', padding: '12px', color: '#16A34A', fontSize: 14, fontWeight: 700 }}>
                  ✓ Approved & Deployed
                </div>
              ) : app.status === 'Pending' ? (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => handleAction(app, 'reject')} className="cred-pill-action" style={{ flex: 1, padding: '10px', justifyContent: 'center', borderRadius: 10 }}>
                    <span className="cred-pill-action-label" style={{ color: '#E8302A', fontSize: 13 }}>{t.reject || 'Decline'}</span>
                  </button>
                  <button onClick={() => handleAction(app, 'approve')} className="cred-btn-black" style={{ flex: 2, padding: '10px', borderRadius: 10, fontSize: 13 }}>
                    {t.hire_now || 'Hire Candidate'}
                  </button>
                </div>
              ) : ['Completed', 'PAID'].includes(app.status) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {!workerRatings[app.id] ? (
                     <div className="cred-card" style={{ padding: '14px', background: 'var(--bg-subtle)' }}>
                        <div className="cred-section-label" style={{ marginBottom: 8 }}>rate worker performance</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {[1,2,3,4,5].map(star => (
                            <span key={star} onClick={async () => {
                              setWorkerRatings(r => ({...r, [app.id]: star}));
                              await FirestoreService.updateApplicationStatus(app.id, app.status, { workerRating: star }).catch(()=>{});
                            }} style={{ fontSize: 28, cursor: 'pointer', color: (workerRatings[app.id] || 0) >= star ? '#FBBF24' : 'var(--border)', transition: '0.1s' }}>★</span>
                          ))}
                        </div>
                     </div>
                  ) : (
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#16A34A' }}>Rated: {'★'.repeat(workerRatings[app.id])}</div>
                  )}
                  {disputeId !== app.id ? (
                    <button onClick={() => setDisputeId(app.id)} className="cred-pill-action" style={{ padding: '8px 12px', justifyContent: 'center', borderRadius: 10 }}>
                      <span className="cred-pill-action-label" style={{ color: '#E8302A', fontSize: 12 }}>⚑ Report Dispute</span>
                    </button>
                  ) : (
                    <div className="fade-in">
                      <textarea placeholder="Describe dispute reason..." value={disputeText} onChange={e => setDisputeText(e.target.value)} style={{ width: '100%', height: 70, padding: '10px', borderRadius: 10, background: 'var(--bg)', fontSize: 13, border: '1px solid #FCA5A5', outline: 'none' }} />
                      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                        <button onClick={() => setDisputeId(null)} className="cred-pill-action" style={{ flex: 1, padding: '8px', justifyContent: 'center', borderRadius: 8 }}>
                          <span className="cred-pill-action-label" style={{ fontSize: 12 }}>Cancel</span>
                        </button>
                        <button onClick={async () => {
                          if (!disputeText.trim()) return;
                          await FirestoreService.updateApplicationStatus(app.id, app.status, { dispute: true, disputeReason: disputeText }).catch(()=>{});
                          setDisputeId(null); setDisputeText('');
                        }} className="cred-btn-black" style={{ flex: 1.5, padding: '8px', borderRadius: 8, fontSize: 12 }}>Submit Report</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : ['Approved', 'Active'].includes(app.status) ? (
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1, padding: '10px 12px', borderRadius: 10, background: '#DCFCE7', color: '#16A34A', fontSize: 12, fontWeight: 700, textAlign: 'center', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {app.status.toUpperCase()}
                  </div>
                  <button onClick={() => {
                    if (window.confirm('Are you sure you want to remove this worker from the job?')) {
                      handleAction(app, 'reject');
                    }
                  }} className="cred-pill-action" style={{ padding: '10px 16px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626' }}>
                    <span className="cred-pill-action-label" style={{ fontSize: 12, fontWeight: 700 }}>Remove</span>
                  </button>
                </div>
              ) : (
                <div style={{ padding: '8px 12px', borderRadius: 10, background: 'var(--bg-subtle)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, textAlign: 'center', border: '1px solid var(--border)' }}>{app.status.toUpperCase()}</div>
              )}
            </div>
          ))
        ) : (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{t.caught_up || 'All Caught Up!'}</h2>
            <div style={{ fontSize: 13, marginTop: 6, color: 'var(--text-muted)' }}>{t.no_pending || 'No pending applications to review.'}</div>
          </div>
        )}
      </div>

      <NavBar active="Home" setActive={setActive} isAdmin={true} t={t} />
    </div>
  );
};

export default WorkerApplicationsScreen;
