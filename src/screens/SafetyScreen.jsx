import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SafetyScreen = ({ setActive, isSafetyModeActive, setIsSafetyModeActive }) => {
  const [sosStatus, setSosStatus] = useState('idle'); // idle, triggered, confirmed

  const triggerSOS = () => {
    setSosStatus('triggered');
    setTimeout(() => {
      setSosStatus('confirmed');
    }, 2000);
  };

  return (
    <div className="fade-in" style={{ height: '100%', background: '#0F172A', display: 'flex', flexDirection: 'column', color: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '24px 24px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => setActive('Home')} style={{ fontSize: 24, cursor: 'pointer' }}>✕</div>
        <div style={{ fontWeight: 800, fontSize: 16 }}>GENIE SAFETY SHIELD</div>
        <div style={{ width: 24 }} />
      </div>

      <div className="full-height-scroll" style={{ padding: '0 24px 40px' }}>
        {/* Status Shield */}
        <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 40 }}>
          <div style={{ 
            width: 120, height: 120, borderRadius: '50%', background: isSafetyModeActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
            border: `2px solid ${isSafetyModeActive ? '#22c55e' : '#334155'}`, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginBottom: 20 
          }}>
            <span style={{ fontSize: 48 }}>{isSafetyModeActive ? "🛡️" : "⚪"}</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900 }}>{isSafetyModeActive ? "Tracking Active" : "Incognito Mode"}</h2>
          <p style={{ color: '#94A3B8', fontSize: 14, marginTop: 8 }}>
            {isSafetyModeActive ? "Your location is being shared with 2 contacts." : "Shield is currently inactive. Turn on for location sharing."}
          </p>
        </div>

        {/* SOS Toggle */}
        <div 
          onClick={() => setIsSafetyModeActive(!isSafetyModeActive)}
          className="tap-effect"
          style={{ 
            background: isSafetyModeActive ? '#1E293B' : '#5B3FC8', 
            borderRadius: 24, padding: '24px', textAlign: 'center', cursor: 'pointer', marginBottom: 20,
            border: isSafetyModeActive ? '1px solid #334155' : 'none'
          }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>
            {isSafetyModeActive ? "DEACTIVATE SHIELD" : "ACTIVATE SAFETY SHIELD"}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
            {isSafetyModeActive ? "Stop sharing live location" : "Shares live location with emergency contacts"}
          </p>
        </div>

        {/* Emergency SOS Button */}
        <div 
          onContextMenu={(e) => e.preventDefault()}
          onClick={sosStatus === 'idle' ? triggerSOS : null}
          className={`tap-effect ${sosStatus === 'idle' ? 'pulse-glow' : ''}`}
          style={{ 
            background: sosStatus === 'confirmed' ? '#22c55e' : '#EF4444', 
            borderRadius: 32, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', marginBottom: 30,
            transition: '0.3s all'
          }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🆘</div>
          <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: 1 }}>
            {sosStatus === 'idle' && "TAP TO ALERT"}
            {sosStatus === 'triggered' && "SENDING..."}
            {sosStatus === 'confirmed' && "CONTACTS ALERTED!"}
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 8, fontWeight: 700 }}>
             {sosStatus === 'idle' && "Hold for 3 seconds to cancel"}
             {sosStatus === 'confirmed' && "Emergency services are on standard standby."}
          </p>
        </div>

        {/* Contacts */}
        <div style={{ background: '#1E293B', borderRadius: 24, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#94A3B8' }}>EMERGENCY CONTACTS (2)</div>
            <div style={{ fontSize: 12, color: '#5B3FC8', fontWeight: 800 }}>EDIT</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {['Mom', 'Dad'].map(c => (
              <div key={c} style={{ flex: 1, background: '#0F172A', padding: '15px', borderRadius: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 20 }}>👤</div>
                <div style={{ fontWeight: 700, fontSize: 12, marginTop: 5 }}>{c}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyScreen;
