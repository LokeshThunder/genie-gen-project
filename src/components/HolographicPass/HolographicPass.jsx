import React, { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * CRED-Style Premium Member Card
 * Looks like an actual CRED / credit card — dark, premium, no gimmicks.
 */
const HolographicPass = forwardRef(({
  userProfile,
  userLevel,
  trustScore,
  jobsCompleted,
  earnings,
  t = {},
  isEditing,
  onUpdateProfile,
  onViewProfile,
  onEdit,
}, ref) => {
  const containerRef = useRef(null);
  useImperativeHandle(ref, () => containerRef.current);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && onUpdateProfile) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdateProfile({ ...userProfile, photoURL: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const userName = userProfile?.name || userProfile?.fullName || 'Genie Worker';
  const initials  = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const skills    = userProfile?.skills?.slice(0, 4) || ['Delivery', 'Logistics', 'Support'];
  const rawLevel  = parseInt(userLevel?.level || 1, 10);
  const level     = Number.isNaN(rawLevel) ? 1 : rawLevel;

  // Card gradient based on level — like CRED's tiered cards
  const cardGradients = [
    'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)',          // L1 – Onyx
    'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)', // L2 – Midnight
    'linear-gradient(135deg, #360033 0%, #0b8793 100%)',            // L3 – Cosmic
    'linear-gradient(135deg, #373B44 0%, #4286f4 100%)',            // L4 – Sapphire
  ];
  const accentColors = ['#F4C430', '#60A5FA', '#A78BFA', '#34D399'];
  const levelLabels  = ['Starter', 'Silver', 'Gold', 'Platinum'];

  const levelIdx  = Math.max(0, Math.min(level - 1, cardGradients.length - 1));
  const cardGrad  = cardGradients[levelIdx];
  const accent    = accentColors[Math.max(0, Math.min(level - 1, accentColors.length - 1))];
  const levelName = levelLabels[Math.max(0, Math.min(level - 1, levelLabels.length - 1))];

  return (
    <div ref={containerRef} style={{ width: '100%', padding: '0 4px', marginBottom: 20 }}>

      {/* ── Premium Card ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%',
          borderRadius: 24,
          background: cardGrad,
          padding: '28px 24px 24px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
      >
        {/* Decorative circles — like CRED card texture */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -30,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none',
        }} />

        {/* Top row: Logo chip + Edit */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          {/* Chip icon (credit card style) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 26, borderRadius: 6,
              background: `linear-gradient(135deg, ${accent} 0%, rgba(255,255,255,0.6) 100%)`,
              opacity: 0.85,
            }} />
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase' }}>
              JOB GENIE
            </div>
          </div>

          {/* Edit button */}
          {!isEditing && onEdit && (
            <div
              onClick={e => { e.stopPropagation(); onEdit(); }}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, cursor: 'pointer',
              }}
            >
              ✏️
            </div>
          )}
        </div>

        {/* Avatar + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          {/* Avatar */}
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            border: `2px solid ${accent}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: '#FFFFFF',
            overflow: 'hidden', flexShrink: 0, position: 'relative',
          }}>
            {userProfile?.photoURL
              ? <img src={userProfile.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span>{initials || '👤'}</span>
            }
            {isEditing && (
              <label style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                <span style={{ fontSize: 16 }}>📸</span>
              </label>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {isEditing ? (
              <input
                value={userName}
                onChange={e => onUpdateProfile({ ...userProfile, name: e.target.value })}
                onClick={e => e.stopPropagation()}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: `1px solid ${accent}55`,
                  color: '#FFF', borderRadius: 8,
                  width: '100%', padding: '6px 10px',
                  fontSize: 16, fontWeight: 700, marginBottom: 4,
                  fontFamily: 'inherit',
                }}
              />
            ) : (
              <div style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', letterSpacing: -0.5, marginBottom: 4 }}>
                {userName}
              </div>
            )}
            {/* Level badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: `${accent}22`,
              border: `1px solid ${accent}55`,
              borderRadius: 999, padding: '3px 10px',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: 1 }}>
                {levelName} · Level {level}
              </span>
            </div>
          </div>
        </div>

        {/* Details row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '16px 20px',
          marginBottom: isEditing ? 20 : 24,
        }}>
          {/* DOB */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>
              {t.dob || 'Date of Birth'}
            </div>
            {isEditing ? (
              <input type="date" max={new Date().toISOString().split('T')[0]} value={userProfile?.dob || ''} onChange={e => onUpdateProfile({ ...userProfile, dob: e.target.value })} onClick={e => e.stopPropagation()}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFF', borderRadius: 6, width: '100%', padding: '5px 8px', fontSize: 11, fontFamily: 'inherit' }} />
            ) : (
              <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>{userProfile?.dob || '—'}</div>
            )}
          </div>

          {/* Experience */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>
              {t.experience || 'Experience'}
            </div>
            {isEditing ? (
              <input value={userProfile?.experience || ''} onChange={e => onUpdateProfile({ ...userProfile, experience: e.target.value })} onClick={e => e.stopPropagation()} placeholder="e.g. 2 Years"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFF', borderRadius: 6, width: '100%', padding: '5px 8px', fontSize: 11, fontFamily: 'inherit' }} />
            ) : (
              <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>{userProfile?.experience || '—'}</div>
            )}
          </div>

          {/* Gender */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>
              {t.gender || 'Gender'}
            </div>
            {isEditing ? (
              <select value={userProfile?.gender || ''} onChange={e => onUpdateProfile({ ...userProfile, gender: e.target.value })} onClick={e => e.stopPropagation()}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFF', borderRadius: 6, width: '100%', padding: '5px 8px', fontSize: 11, fontFamily: 'inherit' }}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>{userProfile?.gender || '—'}</div>
            )}
          </div>

          {/* Preferred Areas */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>
              {t.preferred_areas || 'Preferred Areas'}
            </div>
            {isEditing ? (
              <input value={userProfile?.preferredAreas || ''} onChange={e => onUpdateProfile({ ...userProfile, preferredAreas: e.target.value })} onClick={e => e.stopPropagation()}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFF', borderRadius: 6, width: '100%', padding: '5px 8px', fontSize: 11, fontFamily: 'inherit' }} />
            ) : (
              <div style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF', lineHeight: 1.3 }}>{userProfile?.preferredAreas || '—'}</div>
            )}
          </div>
        </div>

        {/* Skills chips */}
        {!isEditing && (
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 20 }}>
            {skills.map((skill, idx) => (
              <div key={idx} style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 999,
                padding: '4px 12px',
                fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.75)',
                letterSpacing: 0.3,
              }}>
                {skill}
              </div>
            ))}
          </div>
        )}

        {/* Save button / Card number */}
        {isEditing ? (
          <button
            onClick={e => { e.stopPropagation(); onViewProfile && onViewProfile(); }}
            style={{
              width: '100%', padding: '13px',
              borderRadius: 12,
              background: accent,
              color: '#000000',
              border: 'none', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {t.save_changes || 'Save Changes'}
          </button>
        ) : (
          /* Bottom row: stat pills */
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'Jobs',    value: jobsCompleted || 0 },
              { label: 'Rating',  value: '4.9 ⭐' },
              { label: 'Trust',   value: `${trustScore || 100}%` },
              { label: 'Earned',  value: earnings || '₹0' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                padding: '8px 6px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
});

export default HolographicPass;
