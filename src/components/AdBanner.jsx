import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AD_ITEMS = [
  {
    id: 'loan',
    title: 'Genie Loans Coming Soon',
    subtitle: 'Zero-interest micro-loans for your growth.',
    icon: '💰',
    bg: 'linear-gradient(135deg, #FF9966, #FF5E62)'
  },
  {
    id: 'benefits',
    title: 'Genie Benefits',
    subtitle: 'Health and insurance coverage for full-time workers.',
    icon: '🛡️',
    bg: 'linear-gradient(135deg, #00B4DB, #0083B0)'
  },
  {
    id: 'ai',
    title: 'Genie AI Assistant',
    subtitle: 'Get help with job applications and scheduling 24/7.',
    icon: '🧞',
    bg: 'linear-gradient(135deg, #8E2DE2, #4A00E0)'
  }
];

const AdBanner = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % AD_ITEMS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = AD_ITEMS[index];

  return (
    <div style={{ position: 'relative', height: 100, borderRadius: 24, overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          style={{ 
            position: 'absolute', 
            inset: 0, 
            background: current.bg, 
            padding: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 16,
            color: '#fff'
          }}
        >
          <div style={{ fontSize: 32 }}>{current.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 2 }}>{current.title}</div>
            <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.9 }}>{current.subtitle}</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {AD_ITEMS.map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  background: i === index ? '#fff' : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.3s'
                }} 
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdBanner;
