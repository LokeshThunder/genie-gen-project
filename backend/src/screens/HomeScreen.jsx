import React, { useState, useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { XP_LEVELS, getProgressToNextLevel } from '../constants/gamification';
import AdBanner from '../components/AdBanner';
import { HapticService } from '../services/hapticService';
import QRScannerModal from '../components/QRScannerModal';
import { FirestoreService } from '../services/firestoreService';

const HomeScreen = ({
  setActive, isSafetyModeActive, userXP = 0,
  userLevel = XP_LEVELS[0], userProfile, user,
  jobs = [], applications = [], userRole, t = {}, theme,
  showDemoBanner = false, onDismissDemo,
}) => {
  const [loading, setLoading] = useState(true);
  const loadingDismissed = useRef(false);
  const isMountedRef = useRef(true); // Track mount status to prevent async state updates
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Cleanup mounted flag on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Dismiss skeleton when jobs or applications arrive
  useEffect(() => {
    if ((jobs.length > 0 || applications.length > 0) && !loadingDismissed.current && isMountedRef.current) {
      loadingDismissed.current = true;
      if (isMountedRef.current) setLoading(false);
    }
  }, [jobs, applications]);

  // Hard fallback after 5s
  useEffect(() => {
    const id = setTimeout(() => {
      if (!loadingDismissed.current && isMountedRef.current) {
        loadingDismissed.current = true;
        if (isMountedRef.current) setLoading(false);
      }
    }, 5000);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const on = () => {
      if (isMountedRef.current) setIsOnline(true);
    };
    const off = () => {
      if (isMountedRef.current) setIsOnline(false);
    };
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const approvedShifts = applications.filter(a => a.status === 'Approved');
  const activeShifts   = applications.filter(a => a.status === 'Active');
  const completedCount = applications.filter(a => a.status === 'Completed').length;
  const activeShift    = approvedShifts[0] || activeShifts[0];
  const displayName    = userProfile?.fullName || userProfile?.name || 'Genie User';
  const firstName      = displayName.split(' ')[0];
  const initials       = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const progress       = getProgressToNextLevel(userXP);

  const isGigWorker = userProfile?.employmentType === 'gig';
  
  const quickActions = [
    { icon: '🔍', label: t.find_gig || 'Find Gigs',  screen: 'Find Job',  bg: '#F0F4FF' },
    { icon: '💼', label: t.my_jobs  || 'My Jobs',    screen: 'My Jobs',   bg: '#F0FDF4' },
    { icon: '💰', label: t.earnings || 'Earnings',   screen: 'Earnings',  bg: '#FFFBEB' },
    { icon: '🤖', label: t.genie_assistant || 'Genie AI', screen: 'Genie AI',  bg: '#FDF4FF' },
    (!isGigWorker ? { icon: '📅', label: t.schedule || 'Schedule', screen: 'Schedule', bg: '#F5F3FF' } : null),
    (!isGigWorker ? { icon: '🏖️', label: t.time_off || 'Time Off', screen: 'Time Off', bg: '#F0FDF4' } : null),
    { icon: '💸', label: t.instapay || 'InstaPay', screen: 'EWA', bg: '#FEF9C3' },
    (!isGigWorker ? { icon: '🎓', label: t.training || 'Training', screen: 'Training', bg: '#E0E7FF' } : null),
    (!isGigWorker ? { icon: '⏱️', label: t.timesheets || 'Timesheets', screen: 'Timesheets', bg: '#FFF1F2' } : null),
    { icon: '📄', label: t.documents || 'Documents', screen: 'Documents', bg: '#F8FAFC' },
    { icon: '🎧', label: t.support || 'Support', screen: 'Support', bg: '#FFF7ED' },
  ].filter(Boolean);

  if (loading) return (
    <div style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div className="full-height-scroll" style={{ padding: 'var(--header-pad) 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div className="shimmer" style={{ width: 44, height: 44, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="shimmer" style={{ height: 11, width: '35%', borderRadius: 6, marginBottom: 7 }} />
            <div className="shimmer" style={{ height: 20, width: '55%', borderRadius: 6 }} />
          </div>
        </div>
        <div className="shimmer" style={{ height: 80, borderRadius: 18, marginBottom: 16 }} />
        <div className="shimmer" style={{ height: 110, borderRadius: 18, marginBottom: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
          {[1,2,3,4].map(i => <div key={i} className="shimmer" style={{ height: 76, borderRadius: 14 }} />)}
        </div>
        <div className="shimmer" style={{ height: 90, borderRadius: 18, marginBottom: 12 }} />
        <div className="shimmer" style={{ height: 72, borderRadius: 14, marginBottom: 10 }} />
        <div className="shimmer" style={{ height: 72, borderRadius: 14 }} />
      </div>
    </div>
  );

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div className="full-height-scroll screen-bottom-pad" style={{ padding: 'var(--header-pad) 20px 0', background: 'var(--bg)' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', fontWeight: 500, marginBottom: 3 }}>
              {t.welcome_back || 'Good morning,'}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif', letterSpacing: '-0.5px' }}>
              {firstName} 👋
            </div>
            {!isOnline && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 5, background: '#FEE2E2', borderRadius: 999, padding: '3px 10px' }}>
                <span className="pulse-active-red" />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', fontFamily: 'Inter, sans-serif' }}>{t.offline || 'Offline'}</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Scan QR Button */}
            {userRole === 'worker' && (
              <div 
                onClick={() => { HapticService.lightTap(); setScannerOpen(true); }}
                className="tap-effect" 
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'var(--bg-card)', border: '1.5px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  color: 'var(--text-primary)'
                }}
                title={t.scan_qr_shift || 'Scan QR Shift'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
                  <line x1="7" y1="12" x2="17" y2="12" />
                </svg>
              </div>
            )}
            
            <div onClick={() => setActive('Profile')} className="tap-effect" style={{
              width: 44, height: 44, borderRadius: '50%',
              background: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: '#F4C430',
              fontFamily: 'Sora, sans-serif', cursor: 'pointer', flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
              {initials}
            </div>
          </div>
        </div>

        {/* ── DEMO JOB BANNER (first-time workers only) ── */}
        {showDemoBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
              border: '2px solid #F59E0B',
              borderRadius: 24,
              padding: '24px 22px',
              marginBottom: 20,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(245,158,11,0.25)',
            }}
          >
            {/* Background glow blob */}
            <div style={{
              position: 'absolute', top: -50, right: -50,
              width: 180, height: 180, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(244,196,48,0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Dismiss button */}
            <div
              onClick={(e) => { e.stopPropagation(); onDismissDemo?.(); }}
              style={{
                position: 'absolute', top: 14, right: 14,
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(0,0,0,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, cursor: 'pointer', color: '#92400E', fontWeight: 700,
                zIndex: 2,
              }}
            >
              ✕
            </div>

            <div
              onClick={() => setActive('Demo Job')}
              style={{ cursor: 'pointer', position: 'relative', zIndex: 1 }}
            >
              {/* Top row: icon + text */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
                  style={{
                    width: 72, height: 72, borderRadius: 22,
                    background: '#FFFFFF',
                    border: '2px solid #FDE68A',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 38, flexShrink: 0,
                    boxShadow: '0 4px 16px rgba(245,158,11,0.2)',
                  }}
                >
                  🎯
                </motion.div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 800, color: '#D97706',
                    letterSpacing: '1.4px', fontFamily: 'Sora, sans-serif',
                    marginBottom: 5, textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <span style={{
                      background: '#F59E0B', color: '#FFFFFF',
                      borderRadius: 6, padding: '2px 8px', fontSize: 9,
                    }}>NEW</span>
                    Try a Demo Job!
                  </div>
                  <div style={{
                    fontSize: 19, fontWeight: 900, color: '#111111',
                    fontFamily: 'Sora, sans-serif', lineHeight: 1.2, marginBottom: 5,
                    letterSpacing: '-0.3px',
                  }}>
                    {t.demo_job_title || 'Learn how the app works'}
                  </div>
                  <div style={{
                    fontSize: 13, color: '#92400E',
                    fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: 1.4,
                  }}>
                    {t.demo_job_sub || 'Takes 2 minutes · Guided step-by-step'}
                  </div>
                </div>
              </div>

              {/* Feature pills */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                {['🔍 Apply', '📸 Check In', '✅ Tasks', '💰 Get Paid'].map(label => (
                  <span key={label} style={{
                    background: 'rgba(255,255,255,0.7)',
                    border: '1px solid #FDE68A',
                    borderRadius: 99, padding: '5px 12px',
                    fontSize: 12, fontWeight: 700,
                    color: '#92400E', fontFamily: 'Inter, sans-serif',
                  }}>
                    {label}
                  </span>
                ))}
              </div>

              {/* CTA button */}
              <motion.div
                animate={{
                  boxShadow: [
                    '0 4px 14px rgba(0,0,0,0.2)',
                    '0 8px 28px rgba(0,0,0,0.35)',
                    '0 4px 14px rgba(0,0,0,0.2)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  background: '#111111', color: '#F4C430',
                  borderRadius: 16, padding: '17px 0',
                  textAlign: 'center', fontSize: 16, fontWeight: 800,
                  fontFamily: 'Sora, sans-serif', letterSpacing: '0.3px',
                }}
              >
                ▶ Start Demo Job — Free Practice
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ── AD BANNER ── */}
        <AdBanner setActive={setActive} />

        {/* ── ACTIVE SHIFT or CTA ── */}
        {userRole === 'worker' && activeShift ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            onClick={() => setActive('Attendance', { appId: activeShift.id, jobId: activeShift.jobId })} className="tap-effect"
            style={{ background: '#F0FDF4', border: '2px solid #BBF7D0', borderRadius: 24, padding: '24px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 20, cursor: 'pointer', boxShadow: '0 8px 24px rgba(34, 197, 94, 0.15)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 32 }}>⚡</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif', marginBottom: 4, lineHeight: 1.2 }}>
                  {approvedShifts[0] ? (t.shift_ready_to_start || 'Shift ready to start') : (t.shift_in_progress || 'Shift in progress')}
                </div>
                <div style={{ fontSize: 14, color: '#16A34A', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  {approvedShifts[0] ? (t.tap_check_in_now || 'Tap below to begin') : (t.tap_view_attendance || 'Tap to view details')}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ flex: 1, background: '#16A34A', borderRadius: 14, padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)' }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#FFF', fontFamily: 'Sora, sans-serif', letterSpacing: '0.5px' }}>
                  {approvedShifts[0] ? (t.start_shift || 'CHECK IN NOW') : (t.view_label || 'VIEW ATTENDANCE')}
                </span>
              </div>
              
              {approvedShifts[0] && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <div 
                    onClick={async (e) => {
                      e.stopPropagation();
                      if(window.confirm(t.confirm_withdraw || "Are you sure you want to withdraw from this job?")) {
                        if (window.HapticService) window.HapticService.heavyPress();
                        try {
                          const job = jobs.find(j => j.id === activeShift.jobId);
                          let trustPenalty = 0;
                          if (job && job.date) {
                            const timeStr = job.time ? (job.time.includes(':') ? job.time : '09:00') : '09:00';
                            const jobStart = new Date(`${job.date}T${timeStr}:00`).getTime();
                            const hoursUntil = (jobStart - Date.now()) / (1000 * 60 * 60);
                            
                            if (hoursUntil < 1) trustPenalty = 5;
                            else if (hoursUntil < 24) trustPenalty = 2;
                          }

                          if (trustPenalty > 0) {
                            const currentScore = userProfile?.trustScore || 100;
                            const newScore = Math.max(0, currentScore - trustPenalty);
                            await FirestoreService.updateUserProfile(user.uid, { trustScore: newScore });
                          }

                          const isDayJob = isGigWorker || (activeShift.jobType && activeShift.jobType.toLowerCase() === 'gig');
                          if (isDayJob) {
                            await FirestoreService.updateApplicationStatus(activeShift.id, 'Leave (Trying to fill ASAP)');
                            await FirestoreService.updateJob(activeShift.jobId, { status: 'Live', isASAP: true });
                          } else {
                            await FirestoreService.updateApplicationStatus(activeShift.id, 'Leave');
                          }
                        } catch(err) {
                          console.error(err);
                        }
                      }
                    }}
                    style={{ flex: 1, background: '#FEF2F2', border: '2px solid #FCA5A5', borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#E8302A', fontFamily: 'Sora, sans-serif' }}>
                      Leave
                    </span>
                  </div>
                  
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      const job = jobs.find(j => j.id === activeShift.jobId);
                      setActive('Worker Chat', { deepLinkJob: job || activeShift });
                    }}
                    className="tap-effect"
                    style={{ flex: 1, background: '#EFF6FF', border: '2px solid #BFDBFE', borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#3B82F6', fontFamily: 'Sora, sans-serif' }}>
                      💬 SOS
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            onClick={() => setActive('Find Job')} className="tap-effect"
            style={{ background: 'var(--bg-subtle)', border: '1.5px solid var(--border)', borderRadius: 20, padding: '18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
          >
            <div style={{ width: 50, height: 50, borderRadius: 14, background: 'var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 24 }}>🎯</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif', marginBottom: 3 }}>{t.ready_next_gig || 'Ready for your next gig?'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>{t.skills_in_demand || 'Your skills are in demand today'}</div>
            </div>
            <div style={{ background: 'var(--text-primary)', borderRadius: 10, padding: '9px 14px', flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#FFF', fontFamily: 'Sora, sans-serif' }}>{t.browse || 'Browse'}</span>
            </div>
          </motion.div>
        )}



        {/* ── QUICK ACTIONS ── */}
        <div style={{ marginBottom: 20 }}>
          <div className="section-header">
            <span className="section-header-title">{t.quick_actions || 'Quick Actions'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
            {quickActions.map((a, i) => (
              <motion.div key={a.screen} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.04 }}
                onClick={() => setActive(a.screen)} className="tap-effect"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-light)', borderRadius: 16, padding: '14px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', minWidth: 0 }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>{a.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'center', fontFamily: 'Inter, sans-serif', lineHeight: 1.2, width: '100%', wordWrap: 'break-word', overflowWrap: 'anywhere' }}>{a.label}</div>
              </motion.div>
            ))}
          </div>
        </div>



        {/* ── QR CODE SCANNER CTA BANNER (HIGHLIGHTED & PULSING GLOW) ── */}
        {userRole === 'worker' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{
              y: 0,
              opacity: 1,
              borderColor: theme === 'dark' ? ['rgba(244,196,48,0.3)', 'rgba(244,196,48,0.8)', 'rgba(244,196,48,0.3)'] : ['rgba(244,196,48,0.4)', 'rgba(244,196,48,0.9)', 'rgba(244,196,48,0.4)'],
              boxShadow: theme === 'dark'
                ? [
                    '0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(244,196,48,0.15)',
                    '0 12px 36px rgba(244,196,48,0.16), 0 0 0 2px rgba(244,196,48,0.45)',
                    '0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(244,196,48,0.15)'
                  ]
                : [
                    '0 4px 16px rgba(0,0,0,0.04), 0 0 0 1px rgba(244,196,48,0.2)',
                    '0 12px 36px rgba(244,196,48,0.22), 0 0 0 2px rgba(244,196,48,0.5)',
                    '0 4px 16px rgba(0,0,0,0.04), 0 0 0 1px rgba(244,196,48,0.2)'
                  ]
            }}
            transition={{
              y: { delay: 0.08, duration: 0.3 },
              opacity: { delay: 0.08, duration: 0.3 },
              borderColor: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
              boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
            }}
            onClick={() => { HapticService.lightTap(); setScannerOpen(true); }}
            className="tap-effect"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, #14120C 0%, #0A0906 100%)'
                : 'linear-gradient(135deg, #FFFDF0 0%, #FFF7D6 100%)',
              border: '2px solid rgba(244,196,48,0.4)',
              borderRadius: 20,
              padding: '18px 20px',
              marginBottom: 16,
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,196,48,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                <div style={{ fontSize: 10, color: '#F4C430', fontWeight: 800, marginBottom: 4, letterSpacing: '1.2px', fontFamily: 'Sora, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F4C430', display: 'inline-block', boxShadow: '0 0 8px #F4C430' }} className="pulse-active-green" />
                  {t.instant_gateway || 'INSTANT GATEWAY'}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif', marginBottom: 3 }}>
                  {t.scan_to_start || 'Scan QR to Start Shift'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>
                  {t.bypass_desc || 'Bypass approval & begin task immediately →'}
                </div>
              </div>
              
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(244,196,48,0.08)',
                border: '1px solid rgba(244,196,48,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F4C430" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
                  <line x1="7" y1="12" x2="17" y2="12" />
                </svg>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STATS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: t.applied_label || 'APPLIED',   count: applications.length, color: '#F0F4FF', text: '#4F46E5' },
            { label: t.active_label || 'ACTIVE',    count: activeShifts.length, color: '#F0FDF4', text: '#16A34A' },
            { label: t.completed_label || 'COMPLETED', count: completedCount,      color: '#FFFBEB', text: '#D97706' },
          ].map(s => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.12 }}
              onClick={() => setActive('My Jobs')} className="tap-effect"
              style={{ background: s.color, borderRadius: 16, padding: '16px 10px', textAlign: 'center', cursor: 'pointer' }}
            >
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif', lineHeight: 1 }}>{s.count}</div>
              <div style={{ fontSize: 9, fontWeight: 800, color: s.text, marginTop: 5, letterSpacing: '0.8px', fontFamily: 'Inter, sans-serif' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── LOANS BANNER ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          onClick={() => setActive('Loans')} className="tap-effect"
          style={{ background: 'linear-gradient(135deg, #FFFDF5 0%, #FFF8E1 100%)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 18, padding: '18px 20px', marginBottom: 16, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 10, color: '#C9A84C', fontWeight: 800, marginBottom: 4, letterSpacing: '1.2px', fontFamily: 'Sora, sans-serif' }}>{t.genie_loans || '⚡ GENIE LOANS'}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif', marginBottom: 3 }}>{t.instant_loans || 'Instant Cash — Up to ₹1,00,000'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>{t.zero_fee_desc || 'Zero fee · Apply in 2 minutes →'}</div>
            </div>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(244,196,48,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💳</div>
          </div>
        </motion.div>

        {/* ── BENEFITS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {[
            { screen: 'Benefits', icon: '🛡️', bg: '#F0FDF4', title: t.genie_benefits || 'Genie Benefits', sub: t.health_accident_insurance || 'Health & Accident Insurance', active: false },
          ].map(item => (
            <motion.div key={item.screen} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.16 }}
              onClick={() => setActive(item.screen)} className="tap-effect"
              style={{ background: 'var(--bg-subtle)', border: `1px solid ${item.active ? '#FECACA' : 'var(--border)'}`, borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: item.active ? '#DC2626' : '#111', fontFamily: 'Sora, sans-serif' }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>{item.sub}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {item.active && <span className="pulse-active-red" />}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── EXPLORE ── */}
        <div style={{ marginBottom: 20 }}>
          <div className="section-header"><span className="section-header-title">{t.explore || 'Explore'}</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: '🏆', label: t.leaderboard || 'Leaderboard', sub: t.see_top_earners || 'See top earners',  screen: 'Leaderboard', bg: '#FFFBEB' },
              { icon: '🌳', label: t.skill_tree || 'Skill Tree',  sub: t.grow_career || 'Grow your career', screen: 'Skill Tree',  bg: '#F0FDF4' },
            ].map(item => (
              <motion.div key={item.screen} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                onClick={() => setActive(item.screen)} className="tap-effect"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px', cursor: 'pointer' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif', marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>{item.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── XP CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
          onClick={() => setActive('Profile')} className="tap-effect"
          style={{
            background: 'var(--text-primary)', borderRadius: 20, padding: '18px 20px',
            marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14,
            cursor: 'pointer', position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,196,48,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(244,196,48,0.12)', border: '1px solid rgba(244,196,48,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            {userLevel.level <= 1 ? '🥉' : userLevel.level <= 3 ? '🥈' : userLevel.level <= 6 ? '🥇' : '💎'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#FFF', fontFamily: 'Sora, sans-serif' }}>
                {userLevel.label}
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 500, marginLeft: 6 }}>Level {userLevel.level}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#F4C430', fontFamily: 'Inter, sans-serif' }}>{userXP} XP</div>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #C9A84C, #F4C430)', borderRadius: 999 }} />
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </motion.div>

        <div style={{ padding: '4px 0 8px', textAlign: 'center', color: '#CCC', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>
          {t.footer_tagline || 'The Future of Work · Job Genie'}
        </div>
      </div>

      <QRScannerModal 
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        user={user}
        jobs={jobs}
        onScanSuccess={(job) => {
          setActive('Tasks', { appId: `${user.uid}_${job.id}`, jobId: job.id });
        }}
      />
    </div>
  );
};

export default memo(HomeScreen, (prev, next) => {
  // Custom comparison: only re-render if core data or role changed
  return (
    prev.jobs === next.jobs &&
    prev.applications === next.applications &&
    prev.userRole === next.userRole &&
    prev.screenParams === next.screenParams
  );
});
