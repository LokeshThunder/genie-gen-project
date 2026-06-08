import React, { useState } from 'react';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';

const SafetyScreen = ({ setActive, isSafetyModeActive, setIsSafetyModeActive, t = {} }) => {
  const [sosStatus, setSosStatus] = useState('idle');

  const triggerSOS = () => {
    setSosStatus('triggered');
    setTimeout(() => {
      setSosStatus('confirmed');
    }, 2000);
  };

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: 'var(--header-pad) 20px 16px', 
        flexShrink: 0, 
        zIndex: 10,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={() => setActive('Home')} className="tap-effect" style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text-primary)', fontWeight: 700, background: 'var(--bg-subtle)' }}>←</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}><bdi>{t.safety_title || "Safety"}</bdi></h1>
        </div>
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '20px 16px', background: 'var(--bg)' }}>
        {/* Status Shield */}
        <div style={{ textAlign: 'center', marginTop: 12, marginBottom: 24 }}>
          <div style={{ 
            width: 80, height: 80, borderRadius: '50%', background: isSafetyModeActive ? '#DCFCE7' : '#FFFFFF', 
            border: isSafetyModeActive ? '1.5px solid #16A34A' : '1.5px solid var(--border)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginBottom: 16,
            boxShadow: 'none'
          }}>
            <span style={{ fontSize: 36 }}>{isSafetyModeActive ? "🛡️" : "⚪"}</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}><bdi>{isSafetyModeActive ? (t.shield_active || "Shield Active") : (t.shield_offline || "Shield Offline")}</bdi></h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 260, margin: '0 auto', lineHeight: 1.5, fontSize: 13, fontWeight: 500 }}>
            <bdi>{isSafetyModeActive ? (t.safety_active_desc || "Your live coordinates are shared with trusted contacts.") : (t.safety_offline_desc || "Turn on safety shield for live tracking during shifts.")}</bdi>
          </p>
        </div>

        {/* SOS Toggle */}
        <div 
          onClick={() => setIsSafetyModeActive(!isSafetyModeActive)}
          className="tap-effect cred-card"
          style={{ 
            background: 'var(--bg-card)', 
            padding: '16px 20px', 
            cursor: 'pointer', 
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
          <div>
            <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 700 }}>
              <bdi>{isSafetyModeActive ? (t.deactivate_safety || "Deactivate Safety Shield") : (t.activate_safety || "Activate Safety Shield")}</bdi>
            </div>
            <div style={{ color: 'var(--text-muted)', marginTop: 2, fontSize: 11, fontWeight: 500 }}>
              <bdi>{isSafetyModeActive ? (t.turn_off_tracking || "Stop sharing location details") : (t.start_sharing_location || "Share location with contacts")}</bdi>
            </div>
          </div>
          <div style={{ width: 40, height: 20, borderRadius: 10, background: isSafetyModeActive ? '#16A34A' : 'var(--border)', position: 'relative', transition: 'background 0.2s' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--bg-card)', position: 'absolute', top: 2, left: isSafetyModeActive ? 22 : 2, transition: 'left 0.2s' }} />
          </div>
        </div>

        {/* Emergency SOS Button */}
        <div 
          onContextMenu={(e) => e.preventDefault()}
          onClick={sosStatus === 'idle' ? triggerSOS : null}
          className="tap-effect cred-card"
          style={{ 
            background: sosStatus === 'confirmed' ? '#DCFCE7' : '#E8302A', 
            border: sosStatus === 'confirmed' ? '1.5px solid #16A34A' : 'none',
            padding: '24px 20px', textAlign: 'center', cursor: 'pointer', marginBottom: 24,
          }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🆘</div>
          <h3 style={{ fontSize: 18, color: sosStatus === 'confirmed' ? '#16A34A' : '#FFFFFF', fontWeight: 700, margin: 0 }}>
            <bdi>
              {sosStatus === 'idle' && (t.call_for_help || "Emergency Help")}
              {sosStatus === 'triggered' && (t.calling_help || "Alerting...")}
              {sosStatus === 'confirmed' && (t.help_is_coming || "Help is on the way")}
            </bdi>
          </h3>
          <div style={{ color: sosStatus === 'confirmed' ? '#5C5C5C' : '#F9FAFB', marginTop: 4, fontSize: 12, fontWeight: 500 }}>
             <bdi>
               {sosStatus === 'idle' && (t.sos_hint || "Tap to alert emergency response team")}
               {sosStatus === 'confirmed' && (t.sos_confirmed || "Support team is contacting you immediately.")}
             </bdi>
          </div>
        </div>

        {/* Contacts */}
        <div className="cred-card" style={{ padding: '20px', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="cred-section-label"><bdi>{t.trusted_contacts || "Trusted Contacts"}</bdi></div>
            <div className="tap-effect" style={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 700 }}><bdi>{t.edit_list || "Edit"}</bdi></div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[{id: 'mom', name: t.contact_mom || 'Mom'}, {id: 'dad', name: t.contact_dad || 'Dad'}].map(c => (
              <div key={c.id} style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', padding: '14px', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>👤</div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700 }}><bdi>{c.name}</bdi></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <NavBar active="Home" setActive={setActive} t={t} />
    </div>
  );
};

export default SafetyScreen;
