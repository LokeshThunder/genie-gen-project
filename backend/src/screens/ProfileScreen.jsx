import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BADGES, getProgressToNextLevel } from '../constants/gamification';
import { LANGUAGES } from '../constants/translations';

import HolographicPass from '../components/HolographicPass/HolographicPass';
import { toPng } from 'html-to-image';
import { Share } from '@capacitor/share';
import { useRef } from 'react';

const ProfileScreen = ({ setActive, onLogout, isAdmin, role, userProfile, onUpdateProfile, userXP = 0, userLevel = { level: 1, label: 'Beginner' }, isDarkMode, setIsDarkMode, theme = 'dark', setTheme, jobsCount = 0, applicationsCount = 0, currentLang, setCurrentLang, t = {} }) => {
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(userProfile || {});
  const cardRef = useRef(null);
  const detailsRef = useRef(null);
  const progress = getProgressToNextLevel(userXP);
  const userRole = isAdmin ? 'admin' : 'worker';

  const calculateProfileStrength = (profile) => {
    if (!profile) return 0;
    let strength = 0;
    if (isAdmin) {
      if (profile.name) strength += 20;
      if (profile.companyHq) strength += 20;
      if (profile.sector) strength += 20;
      if (profile.operationalScale) strength += 20;
      if (profile.companyDescription) strength += 20;
    } else {
      if (profile.name) strength += 20;
      if (profile.dob) strength += 15;
      if (profile.gender) strength += 15;
      if (profile.experience) strength += 15;
      if (profile.preferredAreas) strength += 15;
      if (profile.skills?.length > 0) strength += 20;
    }
    return strength;
  };

  const profileStrength = calculateProfileStrength(userProfile);

  const handleSave = async () => {
    setIsEditing(false);
    if (onUpdateProfile) {
      await onUpdateProfile(editedData);
    }
  };

  const handleExportID = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: 'transparent'
      });
      
      await Share.share({
        title: 'My Industrial ID',
        text: `Check out my verified ${userLevel.label} rank on Genie OS!`,
        url: dataUrl,
        dialogTitle: 'Share Industrial ID'
      });
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const displayName = userProfile?.fullName || userProfile?.name || (isAdmin ? 'Admin' : 'Genie User');
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="fade-in" style={{ flex: 1, background: 'var(--bg)', display: 'flex', flexDirection: 'column', width: '100%', minHeight: 0, overflow: 'hidden' }}>
      <div className="full-height-scroll screen-bottom-pad" style={{ padding: 'calc(var(--header-pad) + 12px) 20px 20px', overflowX: 'hidden', background: 'var(--bg)' }}>
          {userRole === 'worker' && (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 44 }}>
              <div style={{ width: '100%', maxWidth: 480 }}>
                <HolographicPass 
                   ref={cardRef}
                   userProfile={isEditing ? editedData : userProfile} 
                   userLevel={userLevel} 
                   userXP={userXP} 
                   trustScore={userProfile?.trustScore || 100}
                   jobsCompleted={applicationsCount}
                   earnings={userProfile?.earnings || '₹0'}
                   t={t} 
                   isEditing={isEditing}
                   onUpdateProfile={(data) => setEditedData(data)}
                   onViewProfile={() => isEditing ? handleSave() : detailsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                   onEdit={() => setIsEditing(true)}
                   isDarkMode={isDarkMode}
                />
              </div>
            </div>
          )}

          {isAdmin && (
             /* Profile Identity Card for Admin */
             <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, padding: '0 8px' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--cred-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, position: 'relative' }}>
                   🏢
                </div>
                <div style={{ flex: 1 }}>
                   <div style={{ fontSize: 20, color: 'var(--cred-text-primary)', fontWeight: 800 }}>
                     <bdi>{userProfile?.name || userProfile?.fullName || (t.admin_label || "Admin")}</bdi>
                   </div>
                   <div style={{ color: 'var(--cred-text-sub)', marginTop: 4, fontSize: 13, fontWeight: 600 }}>
                     <bdi>{`${userProfile?.sector || (t.operations_label || 'Operations')} • HQ: ${userProfile?.companyHq || 'NCR'}`}</bdi>
                   </div>
                </div>
             </div>
          )}

          {/* Quick Language Toggle */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 }}>
              {t.select_language || 'App Language'}
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
              {['English', 'Hindi', 'Tamil'].map(langLabel => {
                const lang = LANGUAGES.find(l => l.label === langLabel);
                if (!lang) return null;
                const isSelected = currentLang === langLabel;
                return (
                  <div
                    key={langLabel}
                    onClick={() => setCurrentLang(langLabel)}
                    className="tap-effect"
                    style={{
                      padding: '8px 16px',
                      borderRadius: 20,
                      background: isSelected ? 'var(--text-primary)' : 'var(--bg-card)',
                      color: isSelected ? 'var(--bg)' : 'var(--text-primary)',
                      border: `1.5px solid ${isSelected ? 'var(--text-primary)' : 'var(--border)'}`,
                      fontSize: 13,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      flexShrink: 0
                    }}
                  >
                    <span>{lang.flag}</span>
                    <span>{langLabel}</span>
                  </div>
                );
              })}
              <div
                onClick={() => setShowLanguagePicker(true)}
                className="tap-effect"
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1.5px dashed var(--border)',
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0
                }}
              >
                More 🌐
              </div>
            </div>
          </div>

          {/* Profile Completion Bar */}
          <div style={{ marginBottom: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif', marginBottom: 2 }}>
                  {t.profile_strength || 'Profile Strength'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
                  {profileStrength < 60 ? 'Add more details to stand out' : profileStrength < 100 ? 'Almost complete!' : 'Profile complete ✓'}
                </div>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: profileStrength === 100 ? '#DCFCE7' : 'var(--border-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 800,
                color: profileStrength === 100 ? '#16A34A' : '#0D0D0D',
                fontFamily: 'Sora, sans-serif',
              }}>
                {profileStrength}%
              </div>
            </div>
            <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 999, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profileStrength}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', background: profileStrength === 100 ? '#22C55E' : 'linear-gradient(90deg, #C9A84C, #F4C430)', borderRadius: 999 }}
              />
            </div>
          </div>

          {/* Badges */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-header">
              <span className="section-header-title">achievements</span>
              <span className="section-header-action" onClick={() => setActive('Leaderboard')}>See all ›</span>
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }} className="no-scrollbar">
              {BADGES.map((badge, idx) => (
                <div key={badge.id} style={{
                  flexShrink: 0, width: 76,
                  background: 'var(--bg-card)',
                  border: `1.5px solid ${idx < 2 ? '#0D0D0D' : 'var(--border)'}`,
                  borderRadius: 16, padding: '14px 8px',
                  textAlign: 'center',
                  opacity: idx < 2 ? 1 : 0.4,
                  boxShadow: idx < 2 ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{badge.icon}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'Inter, sans-serif' }}>{badge.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-header">
              <span className="section-header-title">settings</span>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {/* Language */}
              <div
                onClick={() => setShowLanguagePicker(true)}
                className="tap-effect"
                style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌐</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{t.app_language || 'App Language'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{currentLang}</div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>›</span>
              </div>
              {/* Employment Type Toggle */}
              {userRole === 'worker' && (
                <div className="tap-effect" style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💼</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Job Mode</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Switch to test UI rendering</div>
                  </div>
                  <select 
                    value={userProfile?.employmentType || 'full_time'} 
                    onChange={async (e) => {
                      const newType = e.target.value;
                      if (onUpdateProfile) {
                        await onUpdateProfile({ employmentType: newType });
                      }
                    }}
                    style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)' }}
                  >
                    <option value="full_time">Full-Time</option>
                    <option value="gig">Gig Worker</option>
                  </select>
                </div>
              )}
              {/* Privacy */}
              <div className="tap-effect" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🛡️</div>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{t.privacy_safety || 'Privacy & Safety'}</div>
                <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>›</span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div
            onClick={onLogout}
            className="tap-effect"
            style={{
              width: '100%', marginBottom: 40,
              padding: '16px', borderRadius: 16,
              fontSize: 14, fontWeight: 700,
              fontFamily: 'Sora, sans-serif',
              background: '#FFF5F5',
              border: '1.5px solid #FECACA',
              color: '#DC2626',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {t.logout || 'Sign out'}
          </div>
      </div>
      
      
      {/* Language Selection Modal */}
      <AnimatePresence>
        {showLanguagePicker && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLanguagePicker(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)' }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ 
                width: '100%', 
                maxWidth: 500, 
                background: 'var(--bg)', 
                borderTopLeftRadius: 24, 
                borderTopRightRadius: 24, 
                padding: '24px', 
                position: 'relative', 
                zIndex: 1,
                boxShadow: '0 -4px 30px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{ width: 40, height: 5, background: 'var(--cred-border)', borderRadius: 10, margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, textAlign: 'center' }}>{t.select_language || 'Select Language'}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxHeight: '60vh', overflowY: 'auto', paddingBottom: 24 }} className="no-scrollbar">
                {LANGUAGES.map(lang => (
                  <div 
                    key={lang.label}
                    onClick={() => {
                      setCurrentLang(lang.label);
                      setShowLanguagePicker(false);
                    }}
                    className="tap-effect cred-card clay-card"
                    style={{ 
                      padding: '16px', 
                      background: currentLang === lang.label ? '#0D0D0D' : '#FFFFFF',
                      color: currentLang === lang.label ? '#FFFFFF' : 'var(--cred-text-primary)',
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      gap: 8, 
                      fontWeight: 700, 
                      cursor: 'pointer',
                      border: currentLang === lang.label ? '1px solid #0D0D0D' : '1px solid var(--cred-border)'
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{lang.flag}</span>
                    <span style={{ fontSize: 13 }}>{lang.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileScreen;
