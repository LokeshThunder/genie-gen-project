import React, { useState } from 'react';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import { HapticService } from '../services/hapticService';

const SupportScreen = ({ setActive, t }) => {
  const [activeTab, setLocalTab] = useState('announcements');

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'var(--header-pad) 20px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={() => setActive('Home')} className="tap-effect" style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>←</div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>{t.support || 'Support & News'}</h1>
        </div>
        <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: 12, padding: 4, marginTop: 16 }}>
          {['announcements', 'chat'].map(tab => (
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
              {tab === 'announcements' ? 'Announcements' : 'Support Chat'}
            </div>
          ))}
        </div>
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '20px 16px' }}>
        {activeTab === 'announcements' ? (
          <div>
            <div className="cred-card" style={{ padding: 16, marginBottom: 12, borderLeft: '4px solid #16A34A' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>TODAY, 09:00 AM</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Safety Protocol Update</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Please ensure all high-visibility vests are worn at the loading dock.</div>
            </div>
            <div className="cred-card" style={{ padding: 16, marginBottom: 12, borderLeft: '4px solid #3B82F6' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>YESTERDAY</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Bonus Payout Processed</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Diwali bonuses have been credited to your Genie wallets!</div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40, fontSize: 14 }}>
            <span style={{ fontSize: 32, display: 'block', marginBottom: 12 }}>💬</span>
            Connecting to a live agent...
          </div>
        )}
      </div>
      <NavBar active="Home" setActive={setActive} t={t} />
    </div>
  );
};

export default SupportScreen;
