import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FirestoreService } from '../services/firestoreService';
import { HapticService } from '../services/hapticService';
import NavBar from '../components/NavBar';

const AdminApprovalsScreen = ({ setActive, timeOffRequests = [], t }) => {
  const [filter, setFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED
  
  const filteredRequests = timeOffRequests.filter(r => r.status === filter);

  const handleUpdateStatus = async (reqId, newStatus) => {
    HapticService.lightTap();
    await FirestoreService.updateTimeOffRequestStatus(reqId, newStatus);
  };

  const handleApproveAll = async () => {
    if (filteredRequests.length === 0) return;
    HapticService.success();
    // In a real app this should be a batched write, but for mock we can just map promises
    await Promise.all(filteredRequests.map(req => 
      FirestoreService.updateTimeOffRequestStatus(req.id, 'APPROVED')
    ));
  };

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'var(--header-pad) 20px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={() => setActive('Home')} className="tap-effect" style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' }}>←</div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Approvals</h1>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }} className="no-scrollbar">
          {['PENDING', 'APPROVED', 'REJECTED'].map(f => (
            <div
              key={f}
              onClick={() => { HapticService.lightTap(); setFilter(f); }}
              className="tap-effect"
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                background: filter === f ? '#0D0D0D' : 'var(--bg-card)',
                color: filter === f ? '#FFFFFF' : 'var(--text-secondary)',
                border: `1px solid ${filter === f ? '#0D0D0D' : 'var(--border)'}`,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </div>
          ))}
        </div>
        
        {filter === 'PENDING' && filteredRequests.length > 0 && (
          <button 
            onClick={handleApproveAll}
            className="cred-pill-action" 
            style={{ padding: '8px 14px', borderRadius: 20, background: '#16A34A', color: 'white', border: 'none', fontWeight: 700, fontSize: 12, flexShrink: 0, boxShadow: '0 4px 10px rgba(22, 163, 74, 0.2)' }}
          >
            Approve All
          </button>
        )}
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '20px 16px' }}>
        {filteredRequests.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>All caught up!</div>
            <div style={{ fontSize: 14 }}>No {filter.toLowerCase()} requests right now.</div>
          </div>
        ) : (
          <AnimatePresence>
            {filteredRequests.map(req => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="cred-card"
                style={{ padding: 16, marginBottom: 16 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>TIME OFF • {req.type}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{req.dateStr}</div>
                    {req.reason && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, background: 'var(--bg-subtle)', padding: '8px 12px', borderRadius: 8 }}>"{req.reason}"</div>}
                  </div>
                  <div style={{ background: req.statusBg, color: req.statusColor, padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800, alignSelf: 'flex-start' }}>{req.status}</div>
                </div>

                {req.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} className="cred-btn" style={{ flex: 1, padding: 12, background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}>Decline</button>
                    <button onClick={() => handleUpdateStatus(req.id, 'APPROVED')} className="cred-btn-black" style={{ flex: 1, padding: 12, background: '#16A34A', color: 'white' }}>Approve</button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      <NavBar active="Home" setActive={setActive} t={t} />
    </div>
  );
};

export default AdminApprovalsScreen;
