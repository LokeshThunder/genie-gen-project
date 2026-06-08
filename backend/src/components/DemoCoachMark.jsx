import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DemoCoachMark — A floating animated tooltip used during the Demo Job walkthrough.
 * Props:
 *   message    {string}  — Main bold instruction text
 *   subtext    {string}  — Secondary smaller description
 *   position   {'top'|'bottom'|'center'} — Vertical anchor
 *   onNext     {fn}      — Called when user taps "Got it →"
 *   onSkip     {fn}      — Called when user taps "Skip demo"
 *   nextLabel  {string}  — Override label for next button (default "Got it →")
 *   step       {number}  — Current step (1-indexed)
 *   totalSteps {number}  — Total steps in demo
 *   showSkip   {bool}    — Whether to show skip link (default true)
 */
const DemoCoachMark = ({
  message,
  subtext,
  position = 'bottom',
  onNext,
  onSkip,
  nextLabel = 'Got it →',
  step = 1,
  totalSteps = 5,
  showSkip = true,
}) => {
  const positionStyle = {
    top: { top: 'max(80px, calc(var(--safe-area-top, 0px) + 60px))', bottom: 'auto' },
    bottom: { bottom: '120px', top: 'auto' },
    center: { top: '50%', transform: 'translateX(-50%) translateY(-50%)', bottom: 'auto' },
  }[position] || { bottom: '120px', top: 'auto' };

  return (
    <AnimatePresence>
      <motion.div
        key={`coach-${step}`}
        initial={{ opacity: 0, scale: 0.92, y: position === 'top' ? -12 : 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        style={{
          position: 'fixed',
          left: '50%',
          transform: position === 'center' ? 'translateX(-50%) translateY(-50%)' : 'translateX(-50%)',
          width: 'calc(100% - 40px)',
          maxWidth: 380,
          zIndex: 9999,
          ...positionStyle,
        }}
      >
        {/* Card */}
        <div style={{
          background: '#111111',
          borderRadius: 22,
          padding: '20px 22px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.07)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Glow accent */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 120, height: 120, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(244,196,48,0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Step progress dots */}
          <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ width: i === step - 1 ? 20 : 6 }}
                transition={{ duration: 0.3 }}
                style={{
                  height: 6,
                  borderRadius: 99,
                  background: i < step ? '#F4C430' : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>

          {/* Emoji indicator */}
          <div style={{ fontSize: 28, marginBottom: 8 }}>
            {step === 1 ? '📋' : step === 2 ? '📸' : step === 3 ? '✅' : step === 4 ? '💳' : '🎉'}
          </div>

          {/* Message */}
          <div style={{
            fontSize: 18,
            fontWeight: 800,
            color: '#FFFFFF',
            fontFamily: 'Sora, sans-serif',
            lineHeight: 1.3,
            marginBottom: subtext ? 8 : 16,
          }}>
            {message}
          </div>

          {/* Subtext */}
          {subtext && (
            <div style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.6)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              lineHeight: 1.5,
              marginBottom: 18,
            }}>
              {subtext}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <motion.div
              onClick={onNext}
              whileTap={{ scale: 0.96 }}
              style={{
                flex: 1,
                background: '#F4C430',
                color: '#111111',
                borderRadius: 12,
                padding: '13px 0',
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 800,
                fontFamily: 'Sora, sans-serif',
                cursor: 'pointer',
              }}
            >
              {nextLabel}
            </motion.div>

            {showSkip && onSkip && (
              <div
                onClick={onSkip}
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.35)',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  whiteSpace: 'nowrap',
                }}
              >
                Skip demo
              </div>
            )}
          </div>
        </div>

        {/* Pulsing arrow indicator (points up toward the action) */}
        {position === 'bottom' && (
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: -28,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 24,
              filter: 'drop-shadow(0 2px 6px rgba(244,196,48,0.5))',
            }}
          >
            ↑
          </motion.div>
        )}
        {position === 'top' && (
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              bottom: -28,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 24,
              filter: 'drop-shadow(0 2px 6px rgba(244,196,48,0.5))',
            }}
          >
            ↓
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default DemoCoachMark;
