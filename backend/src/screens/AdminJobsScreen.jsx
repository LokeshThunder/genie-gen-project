import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NavBar from '../components/NavBar';
import { format12h } from '../utils/timeUtils';
import { HapticService } from '../services/hapticService';

const AdminJobsScreen = ({ setActive, onEditJob, onCreateJob, jobs = [], t = {} }) => {
  const [tab, setTab] = useState('live');
  const [activeQRJob, setActiveQRJob] = useState(null);

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'UNSET';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthNum = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const monthName = monthNames[monthNum];
        if (monthName) return `${day} ${monthName} ${year}`;
      }
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = date.getDate();
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const liveJobs = (jobs || []).filter(j => j.status === 'live' || j.status === 'active' || j.status === 'Live');
  const draftJobs = (jobs || []).filter(j => j.status === 'draft');
  const displayJobs = tab === 'live' ? liveJobs : draftJobs;

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
      {/* Header Container */}
      <div style={{ 
        padding: 'var(--header-pad) 20px 16px', 
        flexShrink: 0, 
        zIndex: 10,
        borderBottom: '1px solid var(--border-light)',
        background: 'var(--bg-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            onClick={() => setActive('Home')}
            className="tap-effect"
            style={{ 
              width: 36, 
              height: 36, 
              borderRadius: '50%', 
              border: '1px solid var(--border)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: 16, 
              color: 'var(--text-primary)', 
              cursor: 'pointer',
              background: 'var(--bg-card)'
            }}>
            ←
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t.my_jobs_title || 'Jobs Inventory'}</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, marginTop: 2 }}>{t.manage_job_postings || 'Track and manage your workforce postings'}</div>
          </div>
        </div>
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '20px 16px', background: 'var(--bg)' }}>
        
        {/* Sub-tabs for Live vs Drafts */}
        <div className="cred-tab-bar" style={{ display: 'flex', gap: 6, marginBottom: 20, padding: '3px' }}>
          <div 
            onClick={() => setTab('live')}
            className={`cred-tab ${tab === 'live' ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}>
            {t.live_jobs || 'ACTIVE'} ({liveJobs.length})
          </div>
          <div 
            onClick={() => setTab('draft')}
            className={`cred-tab ${tab === 'draft' ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}>
            {t.draft_jobs || 'DRAFTS'} ({draftJobs.length})
          </div>
        </div>

        {/* List of Jobs */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {displayJobs.length === 0 ? (
              <div className="cred-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>📦</div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{t.no_jobs_found || 'Empty Inventory'}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 13, lineHeight: 1.5 }}>
                  {t.empty_inventory_message || 'No jobs found in this section. Put up a new post to hire workers.'}
                </p>
                <button onClick={onCreateJob} className="cred-btn-black" style={{ margin: '0 auto' }}>
                  {t.create_job || 'Create New Post'}
                </button>
              </div>
            ) : (
              displayJobs.map(job => (
                <div key={job.id} className="cred-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                      <div className={`cred-badge ${tab === 'live' ? 'cred-badge-green' : 'cred-badge-gray'}`} style={{ display: 'inline-flex', marginBottom: 8 }}>
                        {tab === 'live' ? (t.live_job || 'Active Job') : (t.draft_mode || 'Draft Mode')}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}><bdi>{job.title.toUpperCase()}</bdi></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, fontWeight: 600 }}>
                         <span style={{ color: 'var(--text-primary)' }}>₹{job.wage || 'TBD'} / day</span>
                         <span style={{ color: 'var(--text-muted)' }}>•</span>
                         <span style={{ color: 'var(--text-secondary)' }}>{job.workerCount || 0} Openings</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Shift Details Row */}
                  <div style={{ display: 'flex', gap: 14, padding: '12px 14px', background: 'var(--bg-subtle)', borderRadius: 12, marginBottom: 16, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        <span style={{ fontSize: 16 }}>📅</span>
                        <span style={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 600 }}>
                          <bdi>{formatDateDisplay(job.startDate)}</bdi>
                        </span>
                      </div>
                      <div style={{ width: 1, background: 'var(--border)' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        <span style={{ fontSize: 16 }}>⏱️</span>
                        <span style={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 600 }}>
                          <bdi>{job.startTime || '08:00'} - {job.endTime || '17:00'}</bdi>
                        </span>
                      </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => onEditJob(job)} className="cred-btn-white" style={{ flex: 1, padding: '12px' }}>
                        {t.modify || 'Edit Post'}
                      </button>
                      {job.status === 'live' || job.status === 'active' ? (
                        <button onClick={() => setActive('Applications')} className="cred-btn-black" style={{ flex: 1.5, padding: '12px' }}>
                          {t.reviews || 'Review Candidates'}
                        </button>
                      ) : null}
                    </div>
                    {(job.status === 'live' || job.status === 'active' || job.status === 'Live') && (
                      <button 
                        onClick={() => { HapticService.lightTap(); setActiveQRJob(job); }} 
                        className="cred-btn-white" 
                        style={{ 
                          width: '100%', 
                          padding: '10px', 
                          borderColor: '#D4AF37', 
                          color: '#D4AF37', 
                          fontWeight: 700,
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>📷 {t.show_qr || 'Gateway QR Code'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <div 
        onClick={onCreateJob}
        className="tap-effect"
        style={{ 
          position: 'absolute', 
          bottom: 100, 
          right: 20, 
          zIndex: 60, 
          width: 56, 
          height: 56, 
          borderRadius: '50%', 
          background: 'var(--text-primary)', 
          color: '#FFFFFF', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: 28, 
          cursor: 'pointer', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', 
          fontWeight: 300 
        }}>
        +
      </div>

      <NavBar active="Jobs" setActive={setActive} isAdmin={true} t={t} />

      <AnimatePresence>
        {activeQRJob && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 17, 21, 0.85)',
              backdropFilter: 'blur(16px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }} 
            onClick={() => setActiveQRJob(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '400px',
                backgroundColor: '#1A1D23',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '28px',
                padding: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 0 20px rgba(212,175,55,0.05)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '10px', color: '#D4AF37', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>
                GATEWAY QR ENTRY
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#F9FAFB', margin: '0 0 8px 0', fontFamily: 'Sora, sans-serif' }}>
                {activeQRJob.title.toUpperCase()}
              </h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, marginBottom: 20 }}>
                Wage: ₹{activeQRJob.wage} / day • Location: {activeQRJob.locationName || 'Nearby'}
              </div>

              {/* QR Image Container */}
              <div style={{
                backgroundColor: '#FFFFFF',
                padding: '16px',
                borderRadius: '20px',
                display: 'inline-block',
                margin: '0 auto 20px',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
              }}>
                <img 
                  loading="lazy"
                  decoding="async"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('genie-bypass:' + activeQRJob.id)}`} 
                  alt="Job QR Code" 
                  style={{ width: '200px', height: '200px', display: 'block' }}
                />
              </div>

              <div style={{ color: '#F9FAFB', fontSize: '12px', fontWeight: 500, lineHeight: 1.5, marginBottom: 24, padding: '0 8px' }}>
                Instruct worker to scan this code via the app to bypass approval and check in directly.
              </div>

              <button 
                onClick={() => { HapticService.lightTap(); setActiveQRJob(null); }} 
                className="cred-btn-black"
                style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(135deg, #B8860B, #FFD700)' }}
              >
                Close Gateway
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminJobsScreen;
