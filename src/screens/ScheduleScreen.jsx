import React, { useState } from 'react';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import { HapticService } from '../services/hapticService';

const ScheduleScreen = ({ setActive, t, currentLang }) => {
  const [activeTab, setLocalTab] = useState('upcoming');

  const upcomingShifts = [
    { id: 1, date: 'Oct 24', time: '09:00 AM - 05:00 PM', role: 'Warehouse Associate', location: 'Amazon FC BLR1' },
    { id: 2, date: 'Oct 25', time: '10:00 AM - 04:00 PM', role: 'Delivery Partner', location: 'Zomato Hub' },
  ];

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'var(--header-pad) 20px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={() => setActive('Home')} className="tap-effect" style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>←</div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>{t.schedule || 'Schedule & Bidding'}</h1>
        </div>
        <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: 12, padding: 4, marginTop: 16 }}>
          {['upcoming', 'open_shifts'].map(tab => (
            <div
              key={tab}
              onClick={() => { HapticService.lightTap(); setLocalTab(tab); }}
              style={{
                flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 13, fontWeight: 700,
                borderRadius: 8, background: activeTab === tab ? '#FFF' : 'transparent',
                boxShadow: activeTab === tab ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
            >
              {tab === 'upcoming' ? 'My Shifts' : 'Open Shifts (Bid)'}
            </div>
          ))}
        </div>
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '20px 16px' }}>
        {activeTab === 'upcoming' ? (
          <div>
            {upcomingShifts.map((shift, i) => (
              <motion.div key={shift.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="cred-card" style={{ padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{shift.date}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{shift.time}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{shift.role}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{shift.location}</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="cred-btn" style={{ flex: 1, padding: 8, fontSize: 12, background: 'var(--bg-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>Swap Shift</button>
                  <button className="cred-btn" style={{ flex: 1, padding: 8, fontSize: 12, background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5' }}>Drop Shift</button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40, fontSize: 14 }}>
            <span style={{ fontSize: 32, display: 'block', marginBottom: 12 }}>🔍</span>
            No open shifts available for bidding right now. Check back later!
          </div>
        )}
      </div>
      <NavBar active="Home" setActive={setActive} t={t} />
    </div>
  );
};

export default ScheduleScreen;
