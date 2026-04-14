import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NavBar from '../components/NavBar';

const AdminJobsScreen = ({ setActive, adminJobs = [], onEditJob, onCreateJob }) => {
  const [tab, setTab] = useState('live'); // 'live' or 'draft'

  const liveJobs = adminJobs.filter(j => j.status === 'live');
  const draftJobs = adminJobs.filter(j => j.status === 'draft');

  const displayJobs = tab === 'live' ? liveJobs : draftJobs;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="fade-in" style={{ height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ padding: '32px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            onClick={() => setActive('Profile')}
            className="tap-effect"
            style={{ 
              width: 50, height: 50, borderRadius: 12, 
              overflow: 'hidden', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', fontSize: 24, cursor: 'pointer', 
              background: '#fff', border: '2px solid #000'
            }}>🤵</button>
          <div>
            <div style={{ fontWeight: 950, fontSize: 11, color: '#000', letterSpacing: 2 }}>CAMPAIGN CENTER</div>
            <div style={{ fontWeight: 950, fontSize: 32, color: '#000', letterSpacing: -1.5, lineHeight: 1, marginTop: 4 }}>Campaigns.</div>
          </div>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="full-height-scroll no-scrollbar" 
        style={{ padding: '10px 24px 140px' }}
      >
        
        {/* Sub-tabs for Live vs Drafts */}
        <motion.div variants={itemVariants} style={{ display: 'flex', gap: 8, marginBottom: 32, padding: '8px', borderRadius: 16, border: '2.5px solid #000', background: '#f8f9fa' }}>
          <button 
            onClick={() => setTab('live')}
            className="tap-effect"
            style={{ 
              flex: 1, 
              padding: '16px', 
              color: tab === 'live' ? '#fff' : '#000', 
              borderRadius: 12, 
              textAlign: 'center', 
              fontWeight: 950, 
              fontSize: 13, 
              cursor: 'pointer', 
              transition: '0.2s',
              background: tab === 'live' ? '#000' : 'transparent',
              border: tab === 'live' ? '2px solid #000' : '2px solid transparent',
              letterSpacing: 1
            }}>
            LIVE ({liveJobs.length})
          </button>
          <button 
            onClick={() => setTab('draft')}
            className="tap-effect"
            style={{ 
              flex: 1, 
              padding: '16px', 
              color: tab === 'draft' ? '#fff' : '#000', 
              borderRadius: 12, 
              textAlign: 'center', 
              fontWeight: 950, 
              fontSize: 13, 
              cursor: 'pointer', 
              transition: '0.2s',
              background: tab === 'draft' ? '#000' : 'transparent',
              border: tab === 'draft' ? '2px solid #000' : '2px solid transparent',
              letterSpacing: 1
            }}>
            DRAFTS ({draftJobs.length})
          </button>
        </motion.div>

        {/* List of Jobs */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {displayJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px', borderRadius: 24, border: '2px solid #000', background: '#f8f9fa' }}>
                <div style={{ fontSize: 72, marginBottom: 24 }}>{tab === 'live' ? '🌆' : '📝'}</div>
                <div style={{ fontSize: 24, fontWeight: 950, color: '#000', letterSpacing: -1 }}>No {tab === 'live' ? 'Active' : 'Draft'} Gigs.</div>
                <div style={{ fontSize: 15, color: '#666', marginTop: 12, fontWeight: 700, lineHeight: 1.5 }}>Scale your workforce by creating your first gig campaign today.</div>
                <button 
                  onClick={onCreateJob} 
                  className="tap-effect" 
                  style={{ 
                    marginTop: 32, padding: '20px 40px', borderRadius: 12, 
                    fontWeight: 950, color: '#fff', 
                    fontSize: 13, letterSpacing: 1, background: '#000',
                    border: '2px solid #000'
                  }}
                >
                  START NEW CAMPAIGN
                </button>
              </div>
            ) : (
              displayJobs.map(job => (
                <motion.div 
                   layout
                   key={job.id} 
                   style={{ borderRadius: 24, padding: '32px', border: '2.5px solid #000', background: '#fff' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                    <div>
                      <div style={{ 
                        color: '#000', 
                        fontSize: 10, 
                        fontWeight: 950, 
                        padding: '8px 16px', 
                        borderRadius: 8, 
                        display: 'inline-flex', 
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 16, 
                        letterSpacing: 1.5,
                        background: tab === 'live' ? '#f0fdf4' : '#f8f9fa',
                        border: '2px solid #000'
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: tab === 'live' ? '#4ADE80' : '#888', border: '1px solid #000' }} />
                        {tab === 'live' ? 'LIVE NOW' : 'DRAFT MODE'}
                      </div>
                      <div style={{ fontSize: 26, fontWeight: 950, color: '#000', letterSpacing: -1.5 }}>{job.title}</div>
                      <div style={{ fontSize: 16, color: '#666', marginTop: 12, fontWeight: 850, display: 'flex', alignItems: 'center', gap: 12 }}>
                         <span style={{ color: '#000', fontWeight: 950 }}>₹{job.wage || 'TBD'}</span>
                         <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#000' }} />
                         <span>{job.workerCount || 0} Open Slots</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28, background: '#f8f9fa', border: '2px solid #000' }}>
                      <div style={{ fontSize: 13, fontWeight: 850, color: '#000', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 20 }}>🗓️</span> 
                        <span style={{ color: '#666', flexShrink: 0 }}>Timeline:</span> 
                        <span style={{ fontWeight: 950 }}>{job.startDate || '—'} / {job.endDate || '—'}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 850, color: '#000', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 20 }}>🕑</span> 
                        <span style={{ color: '#666', flexShrink: 0 }}>Shift:</span> 
                        <span style={{ fontWeight: 950 }}>{job.startTime || '08:00'} - {job.endTime || '17:00'}</span>
                      </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16 }}>
                    <button 
                      onClick={() => onEditJob(job)}
                      className="tap-effect"
                      style={{ 
                        flex: 1, padding: '18px', borderRadius: 12, 
                        fontWeight: 950, fontSize: 13, letterSpacing: 1, 
                        color: '#000', background: '#fff', border: '2px solid #000' 
                      }}
                    >
                      MODIFY
                    </button>
                    {job.status === 'live' && (
                      <>
                        <button 
                          onClick={() => setActive('Applications')}
                          className="tap-effect"
                          style={{ 
                            flex: 1.5, padding: '18px', borderRadius: 12, 
                            fontWeight: 950, fontSize: 13, letterSpacing: 1,
                            background: '#000', color: '#fff', 
                            border: '2px solid #000'
                          }}
                        >
                          REVIEWS
                        </button>
                        <button 
                          onClick={() => setActive('Reports')}
                          className="tap-effect"
                          style={{ 
                            width: 56, height: 56, borderRadius: 12, fontSize: 22,
                            background: '#fff', border: '2px solid #000',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          📊
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Floating Action Button */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCreateJob}
        className="tap-effect"
        style={{ 
          position: 'fixed', 
          bottom: 110, 
          right: 28, 
          zIndex: 60, 
          width: 76, 
          height: 76, 
          borderRadius: 20, 
          background: '#000', 
          color: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: 44, 
          border: '2px solid #000',
          cursor: 'pointer',
          boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
        }}>
        +
      </motion.button>

      <NavBar active="Jobs" setActive={setActive} isAdmin={true} />
    </div>
  );
};

export default AdminJobsScreen;
