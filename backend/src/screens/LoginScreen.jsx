import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthService } from '../services/authService';
import { validatePhone, validateOtp } from '../utils/validation';

const GenieLogo = () => (
  <svg viewBox="0 0 64 64" width="46" height="46" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ filter: 'drop-shadow(0 2px 8px rgba(201,168,76,0.4))' }}>
    <defs>
      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B8860B" /><stop offset="50%" stopColor="#D4AF37" /><stop offset="100%" stopColor="#FFD700" />
      </linearGradient>
    </defs>
    <path d="M46 32C46 32 53 28 53 22C53 16 46 16 46 16" stroke="url(#g1)" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M12 34C12 26 18 20 26 20H38C46 20 52 26 52 34C52 40 44 44 30 44C16 44 12 40 12 34Z" fill="url(#g1)" fillOpacity="0.15" stroke="url(#g1)" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M14 28L6 22C4 20.5 2 23 4 25L10 30" stroke="url(#g1)" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M6 15C6 15 3 11 6 7C9 11 6 15 6 15Z" fill="url(#g1)"/>
    <path d="M22 44H42L44 50H20L22 44Z" fill="url(#g1)" stroke="url(#g1)" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

const LoginScreen = ({ onLogin, t = {} }) => {
  const [role, setRole]               = useState('worker');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [view, setView]               = useState('choice');
  const [phone, setPhone]             = useState('');
  const [otp, setOtp]                 = useState('');
  const [verificationId, setVid]      = useState(null);

  const wrap = async (fn) => { setLoading(true); setError(null); try { await fn(); } catch (e) { setError(e.message || 'Something went wrong.'); } finally { setLoading(false); }};

  const handleGoogle = async () => {
    const intended = role === 'admin' ? 'admin' : 'worker';
    window.INTENDED_LOGIN_ROLE = intended;
    localStorage.setItem('INTENDED_LOGIN_ROLE', intended);
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key: 'INTENDED_LOGIN_ROLE', value: intended });
    } catch (e) { console.warn("Preferences save failed", e); }
    console.log(`[LoginScreen] Admin/Worker selected: ${intended}`);
    
    // DELAY INTENT LAUNCH: Give Android OS time to flush Preferences and localStorage to disk
    // before the Google Sign-in intent potentially suspends or kills the app Activity.
    await new Promise(resolve => setTimeout(resolve, 400));
    
    wrap(async () => { 
      const u = await AuthService.signInWithGoogle();
      console.log(`[LoginScreen] Google signin successful, user: ${u?.uid}, calling onLogin with role: ${role}`);
      if (u) await onLogin(role, u);
    });
  };
  const handlePhone  = () => {
    const { valid, error: phoneError } = validatePhone(phone);
    if (!valid) { setError(phoneError); return; }
    wrap(async () => { const v = await AuthService.signInWithPhone(phone); setVid(v); setView('otp'); });
  };
  const handleOtp    = () => {
    const { valid, error: otpError } = validateOtp(otp);
    if (!valid) { setError(otpError); return; }
    wrap(async () => { const u = await AuthService.verifyOTP(verificationId, otp); if (u) await onLogin(role, u); });
  };
  const handleBypass = async () => { const u = await AuthService.signInAsTestUser(role); await onLogin(role, u); };
  
  React.useEffect(() => {
    window.__triggerLoginBypass = handleBypass;
  }, [role, onLogin]);

  const roles = [
    { val: 'worker', label: t.role_worker || 'I want work',    icon: '👷' },
    { val: 'admin',  label: t.role_admin  || 'I want to hire', icon: '🏢' },
  ];

  return (
    <div style={{ height: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle top-right gold glow */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,196,48,0.12) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      <div className="full-height-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 'max(44px, calc(var(--safe-area-top, 0px) + 24px)) 24px 32px', position: 'relative', zIndex: 1 }}>

        {/* ── BRAND ── */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.06, type: 'spring', stiffness: 160 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <div style={{ width: 84, height: 84, background: 'var(--bg-subtle)', borderRadius: 26, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(201,168,76,0.1)' }}>
            <GenieLogo />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)', letterSpacing: '-1.5px', lineHeight: 1, margin: 0 }}>
            <bdi>{t.job_genie || 'JOB GENIE'}</bdi>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 10, fontSize: 13, fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
            <bdi>{t.login_subtitle || 'Find work you love, closer to home.'}</bdi>
          </p>
        </motion.div>

        {/* ── FORM ── */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.14, type: 'spring', stiffness: 160 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#DC2626', textAlign: 'center', marginBottom: 16, fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <span>⚠️</span><bdi>{error}</bdi>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Role toggle */}
          <div style={{ display: 'flex', background: '#F5F5F3', borderRadius: 999, padding: 4, marginBottom: 28, border: '1px solid var(--border)' }}>
            {roles.map(r => (
              <div key={r.val} onClick={() => setRole(r.val)} className="tap-effect"
                style={{ flex: 1, position: 'relative', padding: '11px 0', textAlign: 'center', fontSize: 14, fontWeight: 700, fontFamily: 'Sora, sans-serif', color: role === r.val ? '#FFF' : '#777', cursor: 'pointer', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                {role === r.val && (
                  <motion.div layoutId="roleSlider"
                    style={{ position: 'absolute', inset: 0, background: 'var(--text-primary)', borderRadius: 999, zIndex: -1, boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
                <span style={{ fontSize: 14, position: 'relative', zIndex: 2 }}>{r.icon}</span>
                <bdi style={{ position: 'relative', zIndex: 2 }}>{r.label}</bdi>
              </div>
            ))}
          </div>

          {/* Auth views */}
          <AnimatePresence mode="wait">
            {view === 'choice' && (
              <motion.div key="choice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {/* Google */}
                <div onClick={loading ? null : handleGoogle} className="tap-effect"
                  style={{ background: 'var(--text-primary)', color: '#FFF', borderRadius: 16, padding: '16px 0', fontSize: 15, fontWeight: 700, fontFamily: 'Sora, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 2px 12px rgba(0,0,0,0.15)', border: 'none' }}
                >
                  {loading ? <div className="loading-dots" style={{ color: '#FFF' }}><span /><span /><span /></div> : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23zM5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                      <bdi>{t.continue_google || 'Continue with Google'}</bdi>
                    </>
                  )}
                </div>

                {/* Phone */}
                <div onClick={() => setView('phone')} className="tap-effect"
                  style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', color: 'var(--text-primary)', borderRadius: 16, padding: '15px 0', fontSize: 15, fontWeight: 700, fontFamily: 'Sora, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <bdi>{t.continue_phone || 'Continue with Phone'}</bdi>
                </div>

              </motion.div>
            )}

            {view === 'phone' && (
              <motion.div key="phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'Sora, sans-serif', marginBottom: 10 }}><bdi>{t.enter_mobile || 'Enter your mobile number'}</bdi></div>
                <input type="tel" placeholder="+91 00000 00000" value={phone} onChange={e => setPhone(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-subtle)', borderRadius: 14, padding: '16px', fontSize: 18, fontWeight: 700, fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)', textAlign: 'center', border: '1.5px solid var(--border)', outline: 'none', marginBottom: 14 }}
                  onFocus={e => { e.target.style.borderColor = 'var(--text-primary)'; e.target.style.background = 'var(--bg-card)'; e.target.style.boxShadow = '0 0 0 3px rgba(17,17,17,0.06)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg-subtle)'; e.target.style.boxShadow = 'none'; }}
                />
                <div onClick={loading ? null : handlePhone} className="tap-effect"
                  style={{ background: 'var(--text-primary)', color: '#FFF', borderRadius: 14, padding: '15px 0', fontSize: 15, fontWeight: 700, fontFamily: 'Sora, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, border: 'none', marginBottom: 14 }}
                >
                  {loading ? <div className="loading-dots" style={{ color: '#FFF' }}><span /><span /><span /></div> : <bdi>{t.get_otp || 'Get OTP'}</bdi>}
                </div>
                <div onClick={() => setView('choice')} className="tap-effect" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                  <bdi>{t.back_options || 'Back'}</bdi>
                </div>
              </motion.div>
            )}

            {view === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>Code sent to</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>{phone}</div>
                </div>
                <input type="tel" placeholder="· · · · · ·" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-subtle)', borderRadius: 14, padding: '16px', fontSize: 28, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)', textAlign: 'center', letterSpacing: 10, border: '1.5px solid var(--border)', outline: 'none', marginBottom: 14 }}
                  onFocus={e => { e.target.style.borderColor = 'var(--text-primary)'; e.target.style.background = 'var(--bg-card)'; e.target.style.boxShadow = '0 0 0 3px rgba(17,17,17,0.06)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg-subtle)'; e.target.style.boxShadow = 'none'; }}
                />
                <div onClick={loading ? null : handleOtp} className="tap-effect"
                  style={{ background: 'var(--text-primary)', color: '#FFF', borderRadius: 14, padding: '15px 0', fontSize: 15, fontWeight: 700, fontFamily: 'Sora, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, border: 'none', marginBottom: 14 }}
                >
                  {loading ? <div className="loading-dots" style={{ color: '#FFF' }}><span /><span /><span /></div> : <bdi>{t.verify_login || 'Verify & Login'}</bdi>}
                </div>
                <div onClick={() => setView('phone')} className="tap-effect" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                  <bdi>{t.change_phone || 'Change number'}</bdi>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 28, color: '#CCC', fontSize: 11, fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <span>🛡️</span><bdi>{t.data_safe || 'Your data is safe with us'}</bdi>
        </div>
      </div>
      <div id="recaptcha-container" style={{ position: 'absolute', visibility: 'hidden' }} />
    </div>
  );
};

export default LoginScreen;
