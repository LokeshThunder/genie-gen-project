import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = ({ onForceSkip }) => {
  const [showEscape, setShowEscape] = useState(false);

  // After 3s, show a "taking too long?" escape hatch
  useEffect(() => {
    const timer = setTimeout(() => setShowEscape(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      height: '100%',
      width: '100%',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle ambient glow */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,196,48,0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Logo mark */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        style={{ position: 'relative', zIndex: 1, marginBottom: 32 }}
      >
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: '2.5px solid transparent',
            borderTopColor: '#F4C430',
            borderRightColor: 'rgba(244,196,48,0.3)',
            position: 'absolute',
            inset: -6,
          }}
        />
        {/* Logo box */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 22,
          background: 'radial-gradient(circle at 30% 30%, #FFFFFF 0%, #F7F7F5 100%)',
          border: '1.5px solid rgba(13,13,13,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06), inset 0 2px 4px rgba(255,255,255,0.8)',
        }}>
          <svg viewBox="0 0 64 64" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 2px 6px rgba(212,175,55,0.3))' }}>
            <defs>
              <linearGradient id="gold-load" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#B8860B" />
                <stop offset="50%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#FFD700" />
              </linearGradient>
            </defs>
            <path d="M46 32C46 32 53 28 53 22C53 16 46 16 46 16" stroke="url(#gold-load)" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M12 34C12 26 18 20 26 20H38C46 20 52 26 52 34C52 40 44 44 30 44C16 44 12 40 12 34Z" fill="url(#gold-load)" fillOpacity="0.15" stroke="url(#gold-load)" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M14 28L6 22C4 20.5 2 23 4 25L10 30" stroke="url(#gold-load)" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M6 15C6 15 3 11 6 7C9 11 6 15 6 15Z" fill="url(#gold-load)"/>
            <path d="M22 44H42L44 50H20L22 44Z" fill="url(#gold-load)" stroke="url(#gold-load)" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{ textAlign: 'center', zIndex: 1 }}
      >
        <div style={{
          fontSize: 22,
          fontWeight: 800,
          fontFamily: 'Sora, sans-serif',
          color: 'var(--text-primary)',
          letterSpacing: '-0.5px',
          marginBottom: 6,
        }}>
          JOB GENIE
        </div>
        <div style={{
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--text-muted)',
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.5px',
          marginBottom: 28,
        }}>
          Find work you love
        </div>

        {/* Progress bar */}
        <div style={{
          width: 120,
          height: 3,
          background: 'var(--border-light)',
          borderRadius: 999,
          overflow: 'hidden',
          margin: '0 auto',
        }}>
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '60%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, #F4C430, transparent)',
              borderRadius: 999,
            }}
          />
        </div>

        {/* Escape hatch — appears after 3s */}
        <AnimatePresence>
          {showEscape && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ marginTop: 28 }}
            >
              <div style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                fontFamily: 'Inter, sans-serif',
                marginBottom: 10,
              }}>
                Taking longer than usual...
              </div>
              {onForceSkip && (
                <motion.div
                  onClick={onForceSkip}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'inline-block',
                    background: '#111111',
                    color: '#F4C430',
                    borderRadius: 99,
                    padding: '10px 24px',
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'Sora, sans-serif',
                    cursor: 'pointer',
                  }}
                >
                  Tap to Continue
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;

