import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import { JobService } from '../services/jobService';
import { FirestoreService } from '../services/firestoreService';
import { auth } from '../services/firebaseConfig';
import RatingModal from '../components/RatingModal';
import { safeGet } from '../utils/safeGet';


const MyJobsScreen = ({ setActive, params = {}, t = {} }) => {
  const [activeTab, setLocalTab] = useState(params.initialTab || 'Active');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingContext, setRatingContext] = useState(null);
  const [withdrawing, setWithdrawing] = useState(null);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true' || localStorage.getItem('GENIE_USE_MOCK') === 'true' || window.FORCE_MOCK;
    
    const checkAndUpdateApplications = (newApps) => {
      setApplications(prev => {
        if (prev.length === newApps.length && prev.every((v, i) => v.id === newApps[i].id && v.status === newApps[i].status)) {
          return prev;
        }
        return newApps;
      });
    };

    if (isMock) {
      const allApps = JSON.parse(localStorage.getItem('genie_mock_applications') || '[]');
      const myApps = allApps.filter(a => !userId || a.workerId === userId);
      checkAndUpdateApplications(myApps);
      setLoading(prev => prev === false ? prev : false);
      return;
    }

    if (!userId) { 
      setLoading(prev => prev === false ? prev : false); 
      return; 
    }
    
    const cachedApps = JSON.parse(localStorage.getItem('genie_offline_jobs') || '[]');
    if (cachedApps.length > 0) {
      checkAndUpdateApplications(cachedApps.filter(a => a.workerId === userId));
      setLoading(prev => prev === false ? prev : false);
    }
    
    const unsubscribe = FirestoreService.streamUserApplications(
      userId,
      (data) => { 
        checkAndUpdateApplications(data); 
        localStorage.setItem('genie_offline_jobs', JSON.stringify(data));
        setLoading(prev => prev === false ? prev : false); 
      },
      (err) => {
        if (cachedApps.length === 0) {
          const allApps = JSON.parse(localStorage.getItem('genie_mock_applications') || '[]');
          checkAndUpdateApplications(allApps.filter(a => a.workerId === userId));
        }
        setLoading(prev => prev === false ? prev : false);
      }
    );
    
    return () => unsubscribe();
  }, [userId]);

  const statusMap = {
    'Active': a => a.status === 'Active',
    'Approved': a => a.status === 'Approved',
    'Applied': a => a.status === 'Pending',
    'Completed': a => a.status === 'Completed',
  };

  const jobs = applications.filter(statusMap[activeTab] || (() => false));

  const TABS = ['Applied', 'Approved', 'Active', 'Completed'];
  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab] = applications.filter(statusMap[tab] || (() => false)).length;
    return acc;
  }, {});

  const handleWithdraw = async (jobId) => {
    setWithdrawing(jobId);
    try {
      await FirestoreService.updateApplicationStatus(jobId, 'Withdrawn');
    } catch (e) {
      console.error('Error withdrawing application', e);
    } finally {
      setWithdrawing(null);
    }
  };

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ 
        padding: 'var(--header-pad) 20px 16px', 
        flexShrink: 0, 
        zIndex: 10,
        borderBottom: '1px solid var(--border-light)',
        background: 'var(--bg-card)'
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{t.my_jobs_title || 'My Gigs'}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, marginBottom: 16 }}>{t.manage_operations || 'Track and manage your work schedule'}</p>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div className="cred-tab-bar no-scrollbar" style={{ width: '100%', overflowX: 'auto', display: 'flex', padding: 3, gap: 4 }}>
            {TABS.map(tab => (
              <div
                key={tab}
                onClick={() => setLocalTab(tab)}
                className={`cred-tab ${activeTab === tab ? 'active' : ''}`}
                style={{ flex: '1 0 auto', justifyContent: 'center' }}
              >
                {safeGet(t, tab.toLowerCase()) || tab}
                {tabCounts[tab] > 0 && <span className="cred-tab-badge" style={{ marginLeft: 4 }}>{tabCounts[tab]}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '20px 16px', background: 'var(--bg)' }}>
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16, marginBottom: 16 }} />)
        ) : jobs.length > 0 ? (
          jobs.map(job => (
            <div key={job.id} className="cred-card" style={{ padding: '20px', marginBottom: 16, display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {job.title || job.jobTitle || 'Gig'}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}>
                    {job.company || job.companyName || 'Employer'}
                  </div>
                </div>
                
                {/* Badge */}
                <div className={`cred-badge ${
                  job.status === 'Active' ? 'cred-badge-green' :
                  job.status === 'Approved' ? 'cred-badge-green' :
                  job.status === 'Pending' ? 'cred-badge-orange' : 'cred-badge-gray'
                }`}>
                  {job.status === 'Pending' ? (t.status_pending_review || 'In Review') : (safeGet(t, job.status.toLowerCase()) || job.status)}
                </div>
              </div>

              {/* Details Row */}
              <div style={{ display: 'flex', gap: 14, padding: '12px 14px', background: 'var(--bg-subtle)', borderRadius: 12, marginBottom: 16, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <span style={{ fontSize: 16 }}>📅</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 600 }}>
                    {job.startDate ? new Date(job.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Today'}
                  </span>
                </div>
                <div style={{ width: 1, background: 'var(--border)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <span style={{ fontSize: 16 }}>💰</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>
                    ₹{job.wage || 700}/{t.day || 'day'}
                  </span>
                </div>
              </div>

              {/* Active — progress bar + tasks button */}
              {job.status === 'Active' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Work Progress</span>
                    <span style={{ color: 'var(--text-primary)', fontSize: 11, fontWeight: 700 }}>{job.progress || 0}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 999, overflow: 'hidden', marginBottom: 16 }}>
                    <div style={{ width: `${job.progress || 0}%`, height: '100%', background: 'var(--text-primary)' }} />
                  </div>
                  <button onClick={() => setActive('Tasks', { appId: job.id })} className="cred-btn-black" style={{ width: '100%', padding: '12px' }}>
                    {t.view_tasks || 'View Tasks'}
                  </button>
                </div>
              )}

              {/* Approved — go to site */}
              {job.status === 'Approved' && (
                <button onClick={() => setActive('Attendance', { appId: job.id, jobId: job.jobId })} className="cred-btn-black" style={{ width: '100%', padding: '12px' }}>
                  {t.proceed_to_site || 'Proceed to Work Site'}
                </button>
              )}

              {/* Pending */}
              {job.status === 'Pending' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1, padding: '10px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#D97706', background: '#FEF3C7', borderRadius: 10 }}>
                    {t.status_pending || 'Application in review'}
                  </div>
                  <button 
                    onClick={() => handleWithdraw(job.id)}
                    disabled={withdrawing === job.id}
                    className="cred-pill-action"
                    style={{ flex: 0.5, padding: '10px', justifyContent: 'center', borderRadius: 10, background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: '#DC2626' }}
                  >
                    <span className="cred-pill-action-label" style={{ fontSize: 12 }}>
                      {withdrawing === job.id ? '...' : (t.withdraw || 'Withdraw')}
                    </span>
                  </button>
                </div>
              )}

              {/* Completed — rate employer */}
              {job.status === 'Completed' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="cred-badge cred-badge-green" style={{ flex: 1.2, padding: '12px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
                    ✓ Work Completed
                  </div>
                  <button
                    onClick={() => setRatingContext({ type: 'worker_rates_company', targetName: job.company || job.companyName || 'Employer', jobTitle: job.title || job.jobTitle || 'Gig', appId: job.id })}
                    className="cred-pill-action"
                    style={{ flex: 1, padding: '8px 12px', justifyContent: 'center', borderRadius: 10 }}
                  >
                    <span className="cred-pill-action-label" style={{ fontSize: 12 }}>{t.rate || 'Rate Employer'}</span>
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>📬</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{t.no_gigs || 'No Gigs Found'}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 13, lineHeight: 1.5 }}>
              {activeTab === 'Applied' ? (t.no_pending_units || 'You have no applications under review.') :
               activeTab === 'Approved' ? (t.no_approved_jobs || 'No upcoming approved shifts.') :
               activeTab === 'Active' ? (t.no_active_ops || 'No active work shifts right now.') :
               (t.no_completed_records || 'No completed gig history found.')}
            </p>
            <button onClick={() => setActive('Find Job')} className="cred-btn-black" style={{ display: 'inline-flex', margin: '0 auto' }}>
              {t.find_gig || 'Search Gigs'}
            </button>
          </div>
        )}
      </div>

      <RatingModal
        isOpen={!!ratingContext}
        onClose={() => setRatingContext(null)}
        context={ratingContext}
      />

      <NavBar active="My Jobs" setActive={setActive} t={t} />
    </div>
  );
};

export default MyJobsScreen;
