import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AccessibleModal from './AccessibleModal';

// Swipeable Tutorial for First-Time Workers
const TUTORIAL_SLIDES = [
  {
    emoji: '🔍',
    title: 'Find Your Gig',
    desc: 'Browse hundreds of jobs near you — day shifts, part-time gigs, or full-time roles. Filter by location, pay, or category.',
    color: '#00F0FF',
    bg: 'rgba(0, 240, 255, 0.06)',
  },
  {
    emoji: '📋',
    title: 'Apply in One Tap',
    desc: 'See a job you like? Apply instantly. The employer reviews your profile and approves you — usually within minutes.',
    color: '#A78BFA',
    bg: 'rgba(167, 139, 250, 0.06)',
  },
  {
    emoji: '📍',
    title: 'Check In & Earn',
    desc: 'Arrive at the site, tap Check In, and start earning. Your GPS confirms your location automatically. Check out when done.',
    color: '#22C55E',
    bg: 'rgba(34, 197, 94, 0.06)',
  },
];

const TutorialModal = ({ isOpen = true, onClose }) => {
  const [slide, setSlide] = useState(0);
  const current = TUTORIAL_SLIDES[slide];
  const isLast = slide === TUTORIAL_SLIDES.length - 1;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: isOpen ? 'flex' : 'none', alignItems: 'flex-end', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}>
      <AccessibleModal isOpen={isOpen} onClose={onClose} titleId="tutorial-title">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          style={{ width: '100%', background: 'var(--bg-card)', borderRadius: '24px 24px 0 0', padding: '40px 28px 48px', border: '1px solid var(--border-steel)', borderBottom: 'none' }}>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 36 }}>
          {TUTORIAL_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === slide ? 'true' : 'false'}
              style={{ width: i === slide ? 24 : 8, height: 8, borderRadius: 4, background: i === slide ? current.color : 'var(--border-steel)', transition: 'all 0.3s ease', cursor: 'pointer', border: 'none' }}
            />
          ))}
        </div>

        {/* Emoji */}
        <div style={{ fontSize: 72, textAlign: 'center', marginBottom: 24 }} aria-hidden="true">{current.emoji}</div>

        {/* Content */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 id="tutorial-title" style={{ fontSize: 26, fontWeight: 800, color: current.color, marginBottom: 14, letterSpacing: -0.5 }}>{current.title}</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.7, maxWidth: 320, margin: '0 auto' }}>{current.desc}</p>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12 }}>
          {!isLast && (
            <button
              onClick={onClose}
              className="tap-effect button-outline"
              type="button"
              aria-label="Skip tutorial"
              style={{ flex: 1, padding: '16px', textAlign: 'center', fontSize: 13, borderRadius: 12, cursor: 'pointer', border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'Sora, sans-serif' }}
            >
              Skip
            </button>
          )}
          <button
            onClick={() => isLast ? onClose() : setSlide(s => s + 1)}
            className="tap-effect"
            type="button"
            aria-label={isLast ? 'Get started' : `Next slide, ${isLast ? '' : 'slide ' + (slide + 2) + ' of ' + TUTORIAL_SLIDES.length}`}
            style={{ flex: 2, padding: '16px', textAlign: 'center', fontSize: 14, fontWeight: 800, borderRadius: 12, background: current.color, color: 'var(--text-primary)', cursor: 'pointer', border: 'none', fontFamily: 'Sora, sans-serif' }}
          >
            {isLast ? '🚀 Get Started' : 'Next →'}
          </button>
        </div>
      </motion.div>
      </AccessibleModal>
    </div>
  );
};

// In-App Notification Banner
let _notifCallbacks = [];
export const NotificationService = {
  show: (message, type = 'info') => {
    _notifCallbacks.forEach(cb => cb({ message, type, id: Date.now() }));
  },
  subscribe: (cb) => {
    _notifCallbacks.push(cb);
    return () => { _notifCallbacks = _notifCallbacks.filter(c => c !== cb); };
  }
};

export const NotificationBanner = () => {
  const [notifications, setNotifications] = useState([]);

  React.useEffect(() => {
    return NotificationService.subscribe((notif) => {
      setNotifications(prev => [...prev, notif]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notif.id));
      }, 4000);
    });
  }, []);

  const colorMap = { info: '#00F0FF', success: '#22C55E', warning: '#FF6B00', error: '#EF4444' };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 16px', gap: 8, pointerEvents: 'none' }}>
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div
            key={n.id}
            initial={{ y: -60, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -60, opacity: 0, scale: 0.9 }}
            style={{
              background: 'rgba(15,23,42,0.96)',
              border: `1px solid ${colorMap[n.type] || colorMap.info}`,
              borderRadius: 12,
              padding: '14px 20px',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text-primary)',
              boxShadow: `0 4px 24px rgba(0,0,0,0.4)`,
              backdropFilter: 'blur(16px)',
              maxWidth: 400,
              width: '100%',
              pointerEvents: 'all',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
            <span style={{ fontSize: 18 }}>
              {n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : n.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            {n.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export { TutorialModal };
export default TutorialModal;
