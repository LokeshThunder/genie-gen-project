import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoCoachMark from '../components/DemoCoachMark';
import { HapticService } from '../services/hapticService';

// ─── Static demo job data — never touches Firebase ───────────────────────────
const DEMO_JOB = {
  id: 'demo_job_001',
  title: 'Warehouse Helper',
  company: 'Job Genie (Demo)',
  location: 'Near You · 1.2 km',
  pay: '₹500',
  payPeriod: 'per day',
  duration: '1 Day Shift',
  time: '9:00 AM – 5:00 PM',
  skills: ['Lifting', 'Sorting', 'Teamwork'],
  isDemo: true,
};

const DEMO_TASKS = [
  { id: 't1', icon: '👋', title: 'Report to supervisor', done: false },
  { id: 't2', icon: '🧤', title: 'Collect tools & safety gear', done: false },
  { id: 't3', icon: '📦', title: 'Complete assigned packing work', done: false },
];

// ─── Confetti particle component ──────────────────────────────────────────────
const Confetti = () => {
  const colors = ['#F4C430', '#16A34A', '#3B82F6', '#EC4899', '#F97316'];
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    color: colors[i % colors.length],
    size: Math.random() * 8 + 6,
    duration: Math.random() * 1.5 + 1.5,
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998, overflow: 'hidden' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: [1, 1, 0], rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            top: 0,
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? '50%' : 2,
            background: p.color,
          }}
        />
      ))}
    </div>
  );
};

// ─── Step screens ─────────────────────────────────────────────────────────────

/** STEP 0: Intro card — "Here's your demo job" */
const IntroStep = ({ onStart, onSkip }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}
  >
    {/* Big job icon */}
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width: 100, height: 100, borderRadius: 28,
        background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
        border: '2px solid #F59E0B',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 52, marginBottom: 28,
        boxShadow: '0 12px 32px rgba(245,158,11,0.25)',
      }}
    >
      📦
    </motion.div>

    <div style={{ textAlign: 'center', marginBottom: 32 }}>
      <div style={{
        fontSize: 11, fontWeight: 800, color: '#D97706',
        letterSpacing: '1.5px', fontFamily: 'Sora, sans-serif',
        marginBottom: 8, textTransform: 'uppercase',
      }}>
        🎯 DEMO JOB — Just for Practice
      </div>
      <h1 style={{
        fontSize: 28, fontWeight: 900, color: '#111111',
        fontFamily: 'Sora, sans-serif', lineHeight: 1.1,
        margin: '0 0 10px', letterSpacing: '-0.5px',
      }}>
        {DEMO_JOB.title}
      </h1>
      <div style={{ fontSize: 15, color: '#6B7280', fontFamily: 'Inter, sans-serif', marginBottom: 6 }}>
        {DEMO_JOB.company} · {DEMO_JOB.location}
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: '#F0FDF4', border: '1.5px solid #BBF7D0',
        borderRadius: 99, padding: '6px 16px',
      }}>
        <span style={{ fontSize: 18, fontWeight: 900, color: '#16A34A', fontFamily: 'Sora, sans-serif' }}>
          {DEMO_JOB.pay}
        </span>
        <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>{DEMO_JOB.payPeriod}</span>
      </div>
    </div>

    {/* What you'll learn */}
    <div style={{
      width: '100%', background: '#F9FAFB',
      border: '1px solid #E5E7EB', borderRadius: 18,
      padding: '20px 22px', marginBottom: 28,
    }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', marginBottom: 14, letterSpacing: '1px' }}>
        YOU WILL LEARN HOW TO
      </div>
      {[
        { icon: '🔍', text: 'Apply for a job' },
        { icon: '📸', text: 'Check in at work' },
        { icon: '✅', text: 'Complete your tasks' },
        { icon: '💰', text: 'Get paid instantly' },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + i * 0.08 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 3 ? 12 : 0 }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: '#FFFFFF', border: '1px solid #E5E7EB',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>
            {item.icon}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111111', fontFamily: 'Inter, sans-serif' }}>
            {item.text}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 16, color: '#16A34A' }}>✓</div>
        </motion.div>
      ))}
    </div>

    {/* CTA buttons */}
    <motion.div
      onClick={onStart}
      whileTap={{ scale: 0.97 }}
      style={{
        width: '100%', background: '#111111', color: '#F4C430',
        borderRadius: 16, padding: '18px 0', textAlign: 'center',
        fontSize: 16, fontWeight: 800, fontFamily: 'Sora, sans-serif',
        cursor: 'pointer', marginBottom: 14,
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      }}
    >
      ▶ Start Demo Job
    </motion.div>

    <div
      onClick={onSkip}
      style={{
        fontSize: 13, color: '#9CA3AF', fontFamily: 'Inter, sans-serif',
        fontWeight: 600, cursor: 'pointer', textAlign: 'center',
      }}
    >
      I already know how — Skip
    </div>
  </motion.div>
);

/** STEP 1: Apply — show job card with pulsing Apply button */
const ApplyStep = ({ onApply }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{ padding: '24px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}
  >
    <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', letterSpacing: '1px', marginBottom: 20 }}>
      STEP 1 OF 4 — APPLY FOR JOB
    </div>

    {/* Job card */}
    <div style={{
      background: '#FFFFFF', border: '1.5px solid #E5E7EB',
      borderRadius: 22, padding: '20px', marginBottom: 20,
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: '#FEF3C7', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 28,
        }}>📦</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#111111', fontFamily: 'Sora, sans-serif' }}>
            {DEMO_JOB.title}
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
            {DEMO_JOB.company}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#16A34A', fontFamily: 'Sora, sans-serif' }}>
            {DEMO_JOB.pay}
          </div>
          <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>{DEMO_JOB.payPeriod}</div>
        </div>
      </div>

      {[
        { icon: '📍', label: DEMO_JOB.location },
        { icon: '🕘', label: DEMO_JOB.time },
        { icon: '📅', label: DEMO_JOB.duration },
      ].map((row, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: i < 2 ? 8 : 0,
          fontSize: 13, color: '#4B5563', fontFamily: 'Inter, sans-serif', fontWeight: 500,
        }}>
          <span style={{ fontSize: 16 }}>{row.icon}</span>
          {row.label}
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        {DEMO_JOB.skills.map(s => (
          <span key={s} style={{
            background: '#F0F4FF', color: '#4F46E5',
            borderRadius: 99, padding: '4px 12px',
            fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif',
          }}>
            {s}
          </span>
        ))}
      </div>
    </div>

    {/* APPLY button — pulsing */}
    <motion.div
      onClick={onApply}
      animate={{
        boxShadow: [
          '0 4px 16px rgba(22,163,74,0.25)',
          '0 8px 32px rgba(22,163,74,0.5)',
          '0 4px 16px rgba(22,163,74,0.25)',
        ],
      }}
      transition={{ duration: 1.8, repeat: Infinity }}
      whileTap={{ scale: 0.97 }}
      style={{
        background: '#16A34A', color: '#FFFFFF',
        borderRadius: 16, padding: '18px 0',
        textAlign: 'center', fontSize: 17, fontWeight: 800,
        fontFamily: 'Sora, sans-serif', cursor: 'pointer',
        letterSpacing: '0.5px',
      }}
    >
      ✅ APPLY NOW
    </motion.div>
  </motion.div>
);

/** STEP 2: Check-In — simulated selfie + check-in */
const CheckInStep = ({ onCheckIn }) => {
  const [phase, setPhase] = useState('ready'); // ready | scanning | done

  const handleCheckIn = () => {
    HapticService?.heavyPress?.();
    setPhase('scanning');
    setTimeout(() => {
      setPhase('done');
      setTimeout(onCheckIn, 1200);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ padding: '24px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', letterSpacing: '1px', marginBottom: 20 }}>
        STEP 2 OF 4 — CHECK IN AT WORK
      </div>

      {/* Fake camera frame */}
      <div style={{
        width: '100%', aspectRatio: '3/4', maxHeight: 300,
        background: phase === 'done' ? '#DCFCE7' : '#111111',
        borderRadius: 22, marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12,
        border: phase === 'done' ? '2px solid #16A34A' : '1px solid #333',
        transition: 'all 0.5s ease',
        overflow: 'hidden', position: 'relative',
      }}>
        {phase === 'ready' && (
          <>
            {/* Fake face outline */}
            <div style={{
              width: 120, height: 140, border: '2px dashed rgba(255,255,255,0.3)',
              borderRadius: '50% 50% 45% 45%',
            }} />
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Position your face here
            </div>
            {/* Demo badge */}
            <div style={{
              position: 'absolute', top: 12, left: 12,
              background: '#F4C430', borderRadius: 8,
              padding: '4px 10px', fontSize: 10, fontWeight: 800, color: '#111',
            }}>
              📷 DEMO MODE
            </div>
          </>
        )}

        {phase === 'scanning' && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🧬</div>
            <div style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
              Verifying identity...
            </div>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ fontSize: 52, marginBottom: 8 }}>💚</div>
            <div style={{ fontSize: 16, color: '#16A34A', fontWeight: 800, fontFamily: 'Sora, sans-serif' }}>
              Checked In!
            </div>
          </motion.div>
        )}
      </div>

      {phase === 'ready' && (
        <motion.div
          onClick={handleCheckIn}
          animate={{
            boxShadow: ['0 4px 16px rgba(0,0,0,0.2)', '0 8px 28px rgba(0,0,0,0.35)', '0 4px 16px rgba(0,0,0,0.2)'],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: '#111111', color: '#FFFFFF',
            borderRadius: 16, padding: '18px 0',
            textAlign: 'center', fontSize: 16, fontWeight: 800,
            fontFamily: 'Sora, sans-serif', cursor: 'pointer',
          }}
        >
          📸 Check In (Demo)
        </motion.div>
      )}

      {phase === 'scanning' && (
        <div style={{
          background: '#F3F4F6', borderRadius: 16, padding: '18px 0',
          textAlign: 'center', fontSize: 15, fontWeight: 700,
          color: '#9CA3AF', fontFamily: 'Inter, sans-serif',
        }}>
          Scanning...
        </div>
      )}
    </motion.div>
  );
};

/** STEP 3: Tasks — complete 3 checklist items */
const TasksStep = ({ onAllDone }) => {
  const [tasks, setTasks] = useState(DEMO_TASKS);
  const completed = tasks.filter(t => t.done).length;
  const progress = (completed / tasks.length) * 100;
  const allDone = completed === tasks.length;

  const toggle = (id) => {
    HapticService?.lightTap?.();
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  useEffect(() => {
    if (allDone) {
      const timer = setTimeout(onAllDone, 900);
      return () => clearTimeout(timer);
    }
  }, [allDone, onAllDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ padding: '24px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', letterSpacing: '1px', marginBottom: 20 }}>
        STEP 3 OF 4 — COMPLETE YOUR TASKS
      </div>

      {/* Progress bar */}
      <div style={{
        background: '#F0FDF4', border: '1.5px solid #BBF7D0',
        borderRadius: 16, padding: '16px 20px', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111111', fontFamily: 'Sora, sans-serif' }}>
            {completed} of {tasks.length} done
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#16A34A', fontFamily: 'Sora, sans-serif' }}>
            {Math.round(progress)}%
          </div>
        </div>
        <div style={{ height: 8, background: '#D1FAE5', borderRadius: 99, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ height: '100%', background: '#16A34A', borderRadius: 99 }}
          />
        </div>
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tasks.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => toggle(task.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: task.done ? '#F0FDF4' : '#FFFFFF',
              border: `1.5px solid ${task.done ? '#BBF7D0' : '#E5E7EB'}`,
              borderRadius: 16, padding: '16px 18px',
              cursor: 'pointer', transition: 'all 0.25s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            {/* Checkbox */}
            <motion.div
              animate={{
                background: task.done ? '#16A34A' : 'transparent',
                borderColor: task.done ? '#16A34A' : '#D1D5DB',
              }}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                border: '2px solid',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s ease',
              }}
            >
              {task.done && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 800 }}
                >
                  ✓
                </motion.span>
              )}
            </motion.div>

            <div style={{ fontSize: 20, flexShrink: 0 }}>{task.icon}</div>

            <div style={{ fontSize: 15, fontWeight: 600, color: '#111111', fontFamily: 'Inter, sans-serif',
              textDecoration: task.done ? 'line-through' : 'none',
              opacity: task.done ? 0.5 : 1, transition: 'all 0.2s',
            }}>
              {task.title}
            </div>

            {!task.done && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                  color: '#F59E0B', fontFamily: 'Inter, sans-serif',
                  background: '#FEF3C7', padding: '4px 10px', borderRadius: 99,
                }}
              >
                TAP
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ marginTop: 20, textAlign: 'center', fontSize: 16, fontWeight: 800, color: '#16A34A', fontFamily: 'Sora, sans-serif' }}
        >
          🎉 All tasks done! Moving to checkout...
        </motion.div>
      )}
    </motion.div>
  );
};

/** STEP 4: Checkout — final payment */
const CheckoutStep = ({ onCheckout }) => {
  const [checking, setChecking] = useState(false);
  const [done, setDone] = useState(false);

  const handleCheckout = () => {
    HapticService?.heavyPress?.();
    setChecking(true);
    setTimeout(() => {
      setDone(true);
      HapticService?.success?.();
      setTimeout(onCheckout, 1500);
    }, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ padding: '24px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', letterSpacing: '1px', marginBottom: 20 }}>
        STEP 4 OF 4 — CHECKOUT & GET PAID
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #FFFDF5, #FFF8E1)',
        border: '1.5px solid #F59E0B',
        borderRadius: 22, padding: '24px', marginBottom: 24, textAlign: 'center',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#92400E', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
          Shift Summary
        </div>
        <div style={{ fontSize: 48, fontWeight: 900, color: '#16A34A', fontFamily: 'Sora, sans-serif', lineHeight: 1 }}>
          ₹500
        </div>
        <div style={{ fontSize: 13, color: '#6B7280', marginTop: 6, fontFamily: 'Inter, sans-serif' }}>
          1 day × ₹500/day
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['8 hrs worked', '3 tasks done', 'On time ✓'].map(tag => (
            <span key={tag} style={{
              background: '#F0FDF4', color: '#16A34A',
              borderRadius: 99, padding: '5px 14px',
              fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {!done ? (
        <motion.div
          onClick={!checking ? handleCheckout : undefined}
          animate={!checking ? {
            boxShadow: ['0 4px 16px rgba(22,163,74,0.2)', '0 8px 32px rgba(22,163,74,0.45)', '0 4px 16px rgba(22,163,74,0.2)'],
          } : {}}
          transition={{ duration: 1.8, repeat: Infinity }}
          whileTap={!checking ? { scale: 0.97 } : {}}
          style={{
            background: checking ? '#9CA3AF' : '#111111',
            color: '#FFFFFF', borderRadius: 16,
            padding: '18px 0', textAlign: 'center',
            fontSize: 16, fontWeight: 800,
            fontFamily: 'Sora, sans-serif',
            cursor: checking ? 'not-allowed' : 'pointer',
            transition: 'background 0.3s',
          }}
        >
          {checking ? '⌛ Processing payment...' : '⚡ Checkout & Get Paid'}
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            background: '#DCFCE7', border: '2px solid #16A34A',
            borderRadius: 16, padding: '18px 0',
            textAlign: 'center', fontSize: 16, fontWeight: 800,
            color: '#16A34A', fontFamily: 'Sora, sans-serif',
          }}
        >
          💸 Payment Sent!
        </motion.div>
      )}
    </motion.div>
  );
};

/** STEP 5: Celebration */
const CelebrationStep = ({ onFinish }) => (
  <>
    <Confetti />
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        padding: '40px 24px', flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      }}
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{ fontSize: 72, marginBottom: 24, lineHeight: 1 }}
      >
        🎉
      </motion.div>

      <div style={{ fontSize: 11, fontWeight: 800, color: '#D97706', letterSpacing: '1.5px', marginBottom: 8 }}>
        DEMO COMPLETE
      </div>
      <h2 style={{
        fontSize: 30, fontWeight: 900, color: '#111111',
        fontFamily: 'Sora, sans-serif', margin: '0 0 12px',
        lineHeight: 1.1, letterSpacing: '-0.5px',
      }}>
        You're ready for real jobs! 🚀
      </h2>
      <p style={{
        fontSize: 15, color: '#6B7280', fontFamily: 'Inter, sans-serif',
        lineHeight: 1.6, marginBottom: 32, maxWidth: 280,
      }}>
        You just completed your first job flow. Now go find real work and earn real money!
      </p>

      {/* Fake payment receipt */}
      <div style={{
        width: '100%', background: '#F0FDF4',
        border: '1.5px solid #BBF7D0',
        borderRadius: 20, padding: '20px 24px',
        marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: '#DCFCE7', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 26, flexShrink: 0,
        }}>
          💳
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 13, color: '#16A34A', fontWeight: 700, fontFamily: 'Inter, sans-serif', marginBottom: 2 }}>
            Demo Payment Received
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#111111', fontFamily: 'Sora, sans-serif', lineHeight: 1 }}>
            ₹500
          </div>
          <div style={{ fontSize: 11, color: '#6B7280', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
            Warehouse Helper · Demo Job
          </div>
        </div>
      </div>

      <motion.div
        onClick={onFinish}
        whileTap={{ scale: 0.97 }}
        animate={{
          boxShadow: ['0 4px 16px rgba(0,0,0,0.15)', '0 10px 32px rgba(0,0,0,0.3)', '0 4px 16px rgba(0,0,0,0.15)'],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          width: '100%', background: '#111111', color: '#F4C430',
          borderRadius: 16, padding: '18px 0',
          textAlign: 'center', fontSize: 16, fontWeight: 800,
          fontFamily: 'Sora, sans-serif', cursor: 'pointer',
          letterSpacing: '0.3px',
        }}
      >
        Find Real Jobs Now 🔍
      </motion.div>

      <div style={{ marginTop: 14, fontSize: 12, color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>
        No real money was used in this demo
      </div>
    </motion.div>
  </>
);

// ─── Coach mark content per step ─────────────────────────────────────────────
const COACH_MARKS = {
  1: {
    message: 'Tap "APPLY NOW" to take this job!',
    subtext: 'In a real job, you tap this green button to apply.',
    position: 'top',
    nextLabel: 'Apply Now →',
  },
  2: {
    message: 'Now Check In when you arrive!',
    subtext: 'At your real job site, tap "Check In" and take a selfie to prove you are there.',
    position: 'top',
    nextLabel: 'Check In →',
  },
  3: {
    message: 'Tick each task when you finish it!',
    subtext: 'Your employer can see your progress in real time.',
    position: 'top',
    nextLabel: 'Got it →',
  },
  4: {
    message: 'Checkout to receive your payment!',
    subtext: 'Once all tasks are done, checkout and your money is sent instantly.',
    position: 'top',
    nextLabel: 'Checkout →',
  },
};

// ─── Main DemoJobScreen ───────────────────────────────────────────────────────
const DemoJobScreen = ({ setActive, t = {} }) => {
  // step: 0=intro, 1=apply, 2=checkin, 3=tasks, 4=checkout, 5=celebration
  const [step, setStep] = useState(0);
  const [showCoach, setShowCoach] = useState(false);

  // Show coach mark after a short delay when step changes
  useEffect(() => {
    if (step >= 1 && step <= 4) {
      const timer = setTimeout(() => setShowCoach(true), 600);
      return () => clearTimeout(timer);
    }
    setShowCoach(false);
  }, [step]);

  const markDone = () => {
    localStorage.setItem('GENIE_DEMO_DONE', 'true');
  };

  const handleSkip = () => {
    markDone();
    setActive('Home');
  };

  const handleFinish = () => {
    markDone();
    setActive('Find Job');
  };

  const advanceStep = () => {
    setShowCoach(false);
    setStep(prev => prev + 1);
  };

  const coach = COACH_MARKS[step];

  return (
    <div style={{
      height: '100%', background: '#FAFAFA',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Header */}
      {step < 5 && (
        <div style={{
          padding: 'var(--header-pad, 16px) 20px 14px',
          background: '#FFFFFF',
          borderBottom: '1px solid #F0F0F0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {step > 0 && step < 5 && (
              <div
                onClick={() => { setShowCoach(false); setStep(p => Math.max(0, p - 1)); }}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: '1.5px solid #E5E7EB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, cursor: 'pointer', background: '#F9FAFB',
                }}
              >
                ←
              </div>
            )}
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#111111', fontFamily: 'Sora, sans-serif' }}>
                {step === 0 ? '🎯 Demo Job' : DEMO_JOB.title}
              </div>
              {step > 0 && (
                <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  Practice Mode · No real data
                </div>
              )}
            </div>
          </div>

          <div
            onClick={handleSkip}
            style={{
              fontSize: 12, color: '#9CA3AF', fontFamily: 'Inter, sans-serif',
              fontWeight: 700, cursor: 'pointer',
              background: '#F3F4F6', padding: '6px 12px',
              borderRadius: 99,
            }}
          >
            Skip ✕
          </div>
        </div>
      )}

      {/* Screen body */}
      <div style={{ flex: 1, overflow: 'hidden auto', display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          {step === 0 && <IntroStep key="intro" onStart={() => setStep(1)} onSkip={handleSkip} />}
          {step === 1 && <ApplyStep key="apply" onApply={advanceStep} />}
          {step === 2 && <CheckInStep key="checkin" onCheckIn={advanceStep} />}
          {step === 3 && <TasksStep key="tasks" onAllDone={advanceStep} />}
          {step === 4 && <CheckoutStep key="checkout" onCheckout={advanceStep} />}
          {step === 5 && <CelebrationStep key="done" onFinish={handleFinish} />}
        </AnimatePresence>
      </div>

      {/* Coach mark overlay */}
      {showCoach && coach && (
        <>
          {/* Dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.55)',
              zIndex: 9990,
            }}
            onClick={() => setShowCoach(false)}
          />
          <DemoCoachMark
            message={coach.message}
            subtext={coach.subtext}
            position={coach.position}
            step={step}
            totalSteps={4}
            nextLabel={coach.nextLabel}
            onNext={() => setShowCoach(false)}
            onSkip={handleSkip}
          />
        </>
      )}
    </div>
  );
};

export default DemoJobScreen;
