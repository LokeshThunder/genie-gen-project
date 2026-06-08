import React from 'react';
import NavBar from '../components/NavBar';

const TimesheetsScreen = ({ setActive, t }) => {
  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'var(--header-pad) 20px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={() => setActive('Home')} className="tap-effect" style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>←</div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Timesheets</h1>
        </div>
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '20px 16px' }}>
        <div className="cred-card" style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Oct 18 - Warehouse</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#16A34A' }}>8h 15m</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>09:00 AM - 05:15 PM</div>
          <div style={{ marginTop: 8, display: 'inline-block', background: '#F0FDF4', color: '#16A34A', padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>APPROVED</div>
        </div>
        <div className="cred-card" style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Oct 19 - Delivery</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#D97706' }}>6h 30m</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>10:00 AM - 04:30 PM</div>
          <div style={{ marginTop: 8, display: 'inline-block', background: '#FFFBEB', color: '#D97706', padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>PENDING</div>
        </div>
      </div>
      <NavBar active="Home" setActive={setActive} t={t} />
    </div>
  );
};

export default TimesheetsScreen;
