import React, { useState } from 'react';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import { HapticService } from '../services/hapticService';

const EWAScreen = ({ setActive, t }) => {
  const [withdrawing, setWithdrawing] = useState(false);

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'var(--header-pad) 20px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={() => setActive('Home')} className="tap-effect" style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>←</div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>InstaPay</h1>
        </div>
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '20px 16px' }}>
        <div className="cred-card" style={{ padding: 24, textAlign: 'center', marginBottom: 20, background: 'linear-gradient(135deg, #111 0%, #222 100%)', color: '#FFF' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Available to Withdraw</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: '#F4C430', marginBottom: 16 }}>₹4,250</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>From completed shifts this week</div>
          
          <button 
            onClick={() => { HapticService.heavyPress(); setWithdrawing(true); }}
            className="cred-btn-black" 
            style={{ width: '100%', padding: 16, marginTop: 24, background: '#F4C430', color: '#111' }}
          >
            Transfer to Bank
          </button>
        </div>

        {withdrawing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="cred-card" style={{ padding: 20, marginBottom: 20, background: '#DCFCE7', border: '1px solid #BBF7D0' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>💸</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#16A34A', marginBottom: 4 }}>Transfer Initiated!</h3>
            <p style={{ fontSize: 12, color: '#15803D' }}>₹4,250 is on its way to your registered bank account. (Ref: #TXN-9982)</p>
          </motion.div>
        )}

        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)' }}>Recent Activity</h3>
        <div className="cred-card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>InstaPay Transfer</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Oct 15, 2023</div>
          </div>
          <div style={{ fontWeight: 700 }}>-₹2,000</div>
        </div>
      </div>
      <NavBar active="Home" setActive={setActive} t={t} />
    </div>
  );
};

export default EWAScreen;
