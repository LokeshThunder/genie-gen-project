import React, { useState } from 'react';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import { HapticService } from '../services/hapticService';
import { FirestoreService } from '../services/firestoreService';

const TimeOffScreen = ({ setActive, user, timeOffRequests = [], t }) => {
  const [requesting, setRequesting] = useState(false);
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      HapticService.error();
      return;
    }
    
    const format = (d) => {
      const date = new Date(d);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    };

    const newReq = {
      dateStr: `${format(startDate)} - ${format(endDate)}`,
      type: leaveType,
      reason: reason,
      status: 'PENDING',
      statusColor: '#D97706',
      statusBg: '#FEF3C7'
    };

    if (user?.uid) {
      await FirestoreService.submitTimeOffRequest(user.uid, newReq);
    }
    
    HapticService.success();
    setRequesting(false);
    setStartDate('');
    setEndDate('');
    setReason('');
    setLeaveType('Sick Leave');
  };

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'var(--header-pad) 20px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={() => setActive('Home')} className="tap-effect" style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>←</div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>{t.time_off || 'Time Off & Leave'}</h1>
        </div>
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '20px 16px' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <div className="cred-card" style={{ flex: 1, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#16A34A' }}>12</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sick Leave</div>
          </div>
          <div className="cred-card" style={{ flex: 1, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#2563EB' }}>5</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Paid Time Off</div>
          </div>
        </div>

        {!requesting ? (
          <button onClick={() => { HapticService.lightTap(); setRequesting(true); }} className="cred-btn-black" style={{ width: '100%', padding: 16, fontSize: 15, marginBottom: 20 }}>+ Request Time Off</button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="cred-card" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>New Request</h3>
            <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 12 }}>
              <option>Sick Leave</option>
              <option>Paid Time Off (PTO)</option>
              <option>Unpaid Leave</option>
            </select>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid var(--border)' }} />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid var(--border)' }} />
            </div>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" rows={3} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setRequesting(false)} className="cred-btn" style={{ flex: 1, padding: 12, background: 'var(--bg-subtle)' }}>Cancel</button>
              <button onClick={handleSubmit} className="cred-btn-black" style={{ flex: 1, padding: 12 }}>Submit</button>
            </div>
          </motion.div>
        )}

        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)' }}>Past Requests</h3>
        {timeOffRequests.length === 0 ? (
          <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>No requests found</div>
        ) : (
          timeOffRequests.map(req => (
            <div key={req.id} className="cred-card" style={{ padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{req.dateStr}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{req.type}</div>
              </div>
              <div style={{ background: req.statusBg, color: req.statusColor, padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>{req.status}</div>
            </div>
          ))
        )}
      </div>
      <NavBar active="Home" setActive={setActive} t={t} />
    </div>
  );
};

export default TimeOffScreen;
