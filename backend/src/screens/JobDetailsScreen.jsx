import React, { useState, useEffect } from 'react';
import { FirestoreService } from '../services/firestoreService';
import { format12h } from '../utils/timeUtils';
import { aiService } from '../services/aiService';
import NavBar from '../components/NavBar';
import LocationPickerModal from '../components/LocationPickerModal';

const JobDetailsScreen = ({ setActive, params, user, userProfile, jobs = [], t = {}, currentLang }) => {
  const job = params || {};
  
  const displayPay = job.pay || `₹${job.wage}`;
  const payPeriodLabel = job.pricingModel === 'monthly' ? 'MONTHLY SALARY' : job.pricingModel === 'hourly' ? 'PER HOUR' : 'DAILY WAGE';
  const displayLoc = job.loc || job.locationName;
  const displayTime = job.time || (job.startTime && job.endTime ? `${format12h(job.startTime)} – ${format12h(job.endTime)}` : (t.flexible || 'Flexible'));
  const displayShift = job.shift || (job.type === 'night' ? 'Night' : job.type === 'full-time' ? 'Full-time' : job.type === 'part-time' ? 'Part-time' : job.type === 'flexible' ? 'Flexible' : 'Day');
  const displayDate = job.date || (job.startDate ? new Date(job.startDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : (t.today || 'Today'));
  const displayCompany = job.company || job.companyName || (t.job_genie_partner || 'JobGenie Partner');
  const displayTasks = job.tasks || [
    t.task_arrive || 'Arrive on time at the location',
    t.task_supervisor || 'Follow supervisor instructions',
    t.task_safe || 'Maintain a safe working environment',
    t.task_clock_out || 'Clock out after shift completion'
  ];
  let displayRequirements = [];
  if (Array.isArray(job.requirements)) {
    displayRequirements = job.requirements;
  } else if (typeof job.requirements === 'string' && job.requirements.trim()) {
    displayRequirements = job.requirements.split(',').map(r => r.trim()).filter(Boolean);
  } else if (Array.isArray(job.requirementsTags) && job.requirementsTags.length > 0) {
    displayRequirements = job.requirementsTags;
  } else {
    displayRequirements = [
      t.req_fitness || 'Physical Fitness', 
      t.req_aadhaar || 'Aadhaar Card', 
      t.req_phone || 'Android Phone'
    ];
  }

  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [tailoring, setTailoring] = useState(false);
  const [tailoredBullets, setTailoredBullets] = useState(null);
  const [tailorError, setTailorError] = useState(null);

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [localCoords, setLocalCoords] = useState(null);
  
  const activeLat = localCoords ? localCoords.lat : job.lat;
  const activeLng = localCoords ? localCoords.lng : job.lng;
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

  const handleSaveLocation = async (coords) => {
    try {
      await FirestoreService.updateJob(job.id, { lat: coords.lat, lng: coords.lng });
      setLocalCoords(coords);
    } catch (e) {
      console.error(e);
      setError("Failed to update location.");
    }
  };

  const handleTailor = async () => {
    setTailoring(true);
    setTailorError(null);
    try {
      const bullets = await aiService.tailorApplication(userProfile, job, currentLang || 'English');
      setTailoredBullets(bullets);
    } catch (e) {
      setTailorError("Failed to tailor application bullets.");
    } finally {
      setTailoring(false);
    }
  };

  useEffect(() => {
    if (userProfile?.appliedJobIds?.includes(job.id)) {
      setApplied(true);
    }
  }, [userProfile, job.id]);

  const suggestedJobs = (jobs || []).filter(j => {
    if (j.id === job.id) return false;
    if (!j.startTime || !job.endTime) return false;
    
    const thisEnd = job.endTime;
    const nextStart = j.startTime;
    
    const isFollowUp = nextStart >= thisEnd && nextStart <= (thisEnd.split(':')[0] * 1 + 2) + ':00';
    return isFollowUp && j.status === 'Live';
  }).slice(0, 2);

  const handleApply = async () => {
    if (!user) {
        setError(t.login_required || "Please log in to apply.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      await FirestoreService.applyToJob(user, job);
      setApplied(true);
      setTimeout(() => setActive('My Jobs', { initialTab: 'Applied' }), 1500);
    } catch (e) {
      console.error('Apply job error:', e);
      setError(`FAILED: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ 
        padding: 'var(--header-pad) 20px 16px', 
        flexShrink: 0, 
        zIndex: 10,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div 
            onClick={() => setActive('Find Job')}
            className="tap-effect"
            style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text-primary)', fontWeight: 700, background: 'var(--bg-subtle)' }}>
            ←
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t.job_details || 'Gig Details'}</h1>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            {job.category === 'Hospitality' ? '🍽️' : job.category === 'Security' ? '🛡️' : '📦'}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0', letterSpacing: -0.5 }}><bdi>{job.title}</bdi></h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}><bdi>{displayCompany}</bdi></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-primary)', fontSize: 11, fontWeight: 700 }}>{job.rating || '4.8'}</span>
                <span style={{ fontSize: 10, color: '#F4C430' }}>★</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, color: 'var(--text-primary)', fontWeight: 700 }}><bdi>{displayPay}</bdi></div>
            <div style={{ color: 'var(--text-muted)', marginTop: 2, fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{payPeriodLabel}</div>
          </div>
        </div>
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '20px 16px 120px', background: 'var(--bg)' }}>
        {error && (
          <div className="cred-alert-strip" style={{ marginBottom: 20, background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#E8302A' }}>
            <span>⚠️</span>
            <div style={{ fontSize: 11, fontWeight: 600 }}>{error}</div>
          </div>
        )}

        {/* Info Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          <div className="cred-pill-action" style={{ padding: '8px 12px', background: 'var(--bg-card)' }}>📅 <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginLeft: 4 }}><bdi>{displayDate}</bdi></span></div>
          <div className="cred-pill-action" style={{ padding: '8px 12px', background: 'var(--bg-card)' }}>📍 <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginLeft: 4 }}><bdi>{displayLoc}{job.pincode ? ` (${job.pincode})` : ''}</bdi></span></div>
          <div className="cred-pill-action" style={{ padding: '8px 12px', background: 'var(--bg-card)' }}>⏰ <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginLeft: 4 }}><bdi>{displayTime}</bdi></span></div>
          <div className="cred-pill-action" style={{ padding: '8px 12px', background: 'var(--bg-card)' }}>⏱️ <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginLeft: 4 }}><bdi>{displayShift}</bdi></span></div>
          <div className="cred-pill-action" style={{ padding: '8px 12px', background: 'var(--bg-card)' }}>👤 <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginLeft: 4 }}><bdi>{job.workerCount || 1} spots</bdi></span></div>
          {job.gender && (
            <div className="cred-pill-action" style={{ padding: '8px 12px', background: 'var(--bg-card)' }}>👥 <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginLeft: 4 }}><bdi>{job.gender === 'Any' ? 'Any Gender' : `${job.gender} Only`}</bdi></span></div>
          )}
          {job.recurringDays && job.recurringDays.length > 0 && (
            <div className="cred-pill-action" style={{ padding: '8px 12px', background: 'var(--bg-card)' }}>🗓️ <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginLeft: 4 }}><bdi>{job.recurringDays.join(', ')}</bdi></span></div>
          )}
          {job.paymentDate && (
            <div className="cred-pill-action" style={{ padding: '8px 12px', background: 'var(--bg-card)' }}>💳 <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginLeft: 4 }}><bdi>Payout: {job.paymentDate}th of month</bdi></span></div>
          )}
          {job.incentives && (
            <div className="cred-pill-action" style={{ padding: '8px 12px', background: 'var(--bg-card)' }}>🎁 <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginLeft: 4 }}><bdi>{job.incentives}</bdi></span></div>
          )}
          {job.urgent && (
            <div className="cred-pill-action" style={{ padding: '8px 12px', background: '#FFF5F5', border: '1px solid #FCA5A5' }}>⚡ <span style={{ fontSize: 12, fontWeight: 700, color: '#E8302A', marginLeft: 4 }}><bdi>URGENT</bdi></span></div>
          )}
        </div>

        {/* Work Location Map */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingLeft: 2 }}>
            <h3 className="cred-section-label" style={{ margin: 0 }}>work location</h3>
            {activeLat && activeLng && (
              <div style={{ display: 'flex', gap: 8 }}>
                {isAdmin && (
                  <button
                    onClick={() => setIsMapModalOpen(true)}
                    style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', background: 'var(--bg-card)', padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer' }}
                  >
                    Edit Pin
                  </button>
                )}
                <a
                  href={`https://www.google.com/maps?q=${activeLat},${activeLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none', background: 'var(--bg-surface)', padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)' }}
                >
                  Open in Maps ↗
                </a>
              </div>
            )}
          </div>

          {activeLat && activeLng ? (
            <div style={{ borderRadius: 14, overflow: 'hidden', border: '1.5px solid var(--border)', position: 'relative' }}>
              {/* Location name bar */}
              <div style={{
                position: 'absolute', top: 10, left: 10, right: 10, zIndex: 10,
                background: 'rgba(255,255,255,0.95)', borderRadius: 10, padding: '8px 12px',
                display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.12)'
              }}>
                <span style={{ fontSize: 16 }}>📍</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{displayLoc}</div>
                  {job.pincode && <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>Pincode: {job.pincode}</div>}
                </div>
              </div>
              <iframe
                title="Work Location"
                width="100%"
                height="220"
                style={{ display: 'block', border: 'none' }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${activeLng - 0.008},${activeLat - 0.006},${activeLng + 0.008},${activeLat + 0.006}&layer=mapnik&marker=${activeLat},${activeLng}`}
                loading="lazy"
              />
              {/* Coordinates bar */}
              <div style={{ background: 'var(--bg-subtle)', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: 10 }}>🌐</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'monospace' }}>
                  {activeLat.toFixed(4)}°N, {activeLng.toFixed(4)}°E
                </span>
              </div>
            </div>
          ) : (
            <div style={{
              borderRadius: 14, border: '1.5px dashed #D1D5DB',
              background: 'var(--bg-subtle)', padding: '28px 20px', textAlign: 'center'
            }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🗺️</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Location Not Pinned Yet
              </div>
              <div style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.5, marginBottom: 12 }}>
                The admin hasn't pinned the exact work location on the map yet.
                Please contact the employer to confirm the address before travelling.
              </div>
              {isAdmin ? (
                <button 
                  onClick={() => setIsMapModalOpen(true)}
                  className="tap-effect"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: '#FFF8E7', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px 14px', display: 'inline-flex', cursor: 'pointer'
                  }}>
                  <span style={{ fontSize: 12 }}>📌</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#92400E' }}>Pin location on Map</span>
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: '#FFF8E7', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px 14px', display: 'inline-flex'
                }}>
                  <span style={{ fontSize: 12 }}>⚠️</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#92400E' }}>Admin: Pin location in Job Settings</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 20 }}>
          <h3 className="cred-section-label" style={{ marginBottom: 8, paddingLeft: 2 }}>job description</h3>
          <div className="cred-card" style={{ padding: '16px 20px' }}>
             <p style={{ color: 'var(--text-primary)', margin: 0, lineHeight: 1.5, fontSize: 14, fontWeight: 500 }}><bdi>{job.description || (t.no_description || 'No description provided.')}</bdi></p>
          </div>
        </div>

        {/* Requirements */}
        <div style={{ marginBottom: 20 }}>
          <h3 className="cred-section-label" style={{ marginBottom: 8, paddingLeft: 2 }}>compliance requirements</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {displayRequirements.map(req => (
              <div key={req} className="cred-badge cred-badge-gray" style={{ padding: '6px 12px', fontSize: 11, border: '1px solid var(--border)' }}>
                ✓ <span style={{ marginLeft: 4 }}><bdi>{req}</bdi></span>
              </div>
            ))}
          </div>
        </div>



        {/* Suggested Jobs */}
        {suggestedJobs.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingLeft: 2 }}>
              <h3 className="cred-section-label" style={{ margin: 0 }}>suggested follow-up gigs</h3>
              <div style={{ background: '#DCFCE7', padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 700, color: '#16A34A', border: '1px solid #BBF7D0' }}>BATCH</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {suggestedJobs.map(sj => (
                <div 
                  key={sj.id}
                  onClick={() => setActive('Job Details', sj)}
                  className="tap-effect cred-card" 
                  style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}><bdi>{sj.title}</bdi></div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: 2, fontSize: 12, fontWeight: 500 }}><bdi>{format12h(sj.startTime)} • {sj.locationName}</bdi></div>
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 700 }}><bdi>₹{sj.wage}</bdi></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Partner */}
        <div style={{ marginBottom: 20 }}>
          <h3 className="cred-section-label" style={{ marginBottom: 8, paddingLeft: 2 }}>authorized partner</h3>
          <div className="cred-card" style={{ padding: '20px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏢</div>
                <div>
                   <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}><bdi>{displayCompany}</bdi></div>
                   <div className="cred-badge cred-badge-green" style={{ marginTop: 2, fontSize: 9 }}>VERIFIED PARTNER</div>
                </div>
             </div>
             <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
                <bdi>{job.companyDescription || (t.company_description_default || `Leading industrial partner focused on high-efficiency workforce deployment.`)}</bdi>
             </p>
          </div>
        </div>
      </div>

      {/* Fixed Action Button */}
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        padding: '16px 20px calc(16px + env(safe-area-inset-bottom))', 
        zIndex: 100,
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-light)',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.03)'
      }}>
        <button 
          onClick={loading || applied ? null : handleApply}
          className="cred-btn-black"
          style={{ 
            width: '100%',
            padding: '14px 0', 
            fontSize: 15,
            opacity: loading ? 0.7 : (applied ? 0.6 : 1),
            fontWeight: 700,
            background: applied ? 'var(--border)' : '#0D0D0D',
            color: applied ? '#6B6B6B' : '#FFFFFF',
            border: applied ? '1px solid #D1D5DB' : 'none'
          }}
          disabled={loading || applied}
        >
          {loading ? (t.processing || 'Processing...') : (applied ? `✓ Applied` : `${t.apply_for_job || 'Apply for Gig'}`)}
        </button>
      </div>

      <LocationPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSave={handleSaveLocation}
        initialLocation={activeLat && activeLng ? { lat: activeLat, lng: activeLng } : null}
      />
    </div>
  );
};

export default JobDetailsScreen;
