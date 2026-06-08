import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AD_ITEMS = [
  {
    id: 'loan',
    title: 'Genie Loans',
    subtitle: 'Instant cash up to ₹1,00,000. Zero processing fee.',
    image: '/ad_quick_cash.png',
    emoji: '💳',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    accent: '#F4C430',
    link: 'Loans',
  },
  {
    id: 'skills',
    title: 'Level Up Skills',
    subtitle: 'Complete tasks to earn XP and unlock higher-paying gigs.',
    image: '/ad_skill_up.png',
    emoji: '🌳',
    bg: 'linear-gradient(135deg, #0f2027 0%, #203a43 100%)',
    accent: '#4ADE80',
    link: 'Leaderboard',
  },
  {
    id: 'insurance',
    title: 'Free Insurance',
    subtitle: '₹2 Lakh accident coverage for all active workers.',
    image: '/ad_insurance.png',
    emoji: '🛡️',
    bg: 'linear-gradient(135deg, #1a0533 0%, #2d1b69 100%)',
    accent: '#A78BFA',
    link: 'Benefits',
  },
];

// Fallback card shown when image fails to load
const FallbackCard = ({ ad }) => (
  <div style={{
    position: 'absolute', inset: 0,
    background: ad.bg,
    display: 'flex', flexDirection: 'column',
    justifyContent: 'flex-end',
  }}>
    {/* Emoji icon top-right */}
    <div style={{
      position: 'absolute', top: 14, right: 16,
      fontSize: 36, opacity: 0.25,
    }}>
      {ad.emoji}
    </div>
    {/* Text */}
    <div style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{
            fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: 1.5, color: ad.accent, marginBottom: 4,
            fontFamily: 'Sora, sans-serif',
          }}>
            {ad.emoji} {ad.title}
          </div>
          <div style={{
            fontSize: 13, fontWeight: 600, color: '#FFFFFF',
            fontFamily: 'Inter, sans-serif', opacity: 0.9,
          }}>
            {ad.subtitle}
          </div>
        </div>
        <div style={{
          background: 'var(--bg-card)', color: 'var(--text-primary)',
          fontSize: 10, fontWeight: 700,
          padding: '5px 11px', borderRadius: 999,
          textTransform: 'uppercase', letterSpacing: 0.5,
          flexShrink: 0, marginLeft: 12,
          fontFamily: 'Sora, sans-serif',
        }}>
          Learn ›
        </div>
      </div>
    </div>
  </div>
);

// Single ad slide — tries image first, falls back to gradient card
const AdSlide = ({ ad }) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {!imgFailed ? (
        <>
          {/* Background image */}
          <img
            src={ad.image}
            alt={ad.title}
            onError={() => setImgFailed(true)}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
            }}
          />
          {/* Gradient overlay for text legibility */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.08) 100%)',
            zIndex: 1,
          }} />
          {/* Text on top of image */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#F4C430', marginBottom: 3, fontFamily: 'Sora, sans-serif' }}>
                  {ad.title}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', opacity: 0.95, fontFamily: 'Inter, sans-serif' }}>
                  {ad.subtitle}
                </div>
              </div>
              <div style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 10, fontWeight: 700, padding: '5px 11px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 0, marginLeft: 12, fontFamily: 'Sora, sans-serif' }}>
                Apply ›
              </div>
            </div>
          </div>
        </>
      ) : (
        <FallbackCard ad={ad} />
      )}
    </div>
  );
};

const AdBanner = ({ setActive }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % AD_ITEMS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = AD_ITEMS[index];

  return (
    <div
      onClick={() => setActive && setActive(current.link)}
      className="tap-effect"
      style={{
        position: 'relative',
        height: 110,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #E8E8E6',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        marginBottom: 20,
        cursor: 'pointer',
        background: '#F5F5F3', // placeholder bg while loading
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <AdSlide ad={current} />
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div style={{
        position: 'absolute', top: 10, right: 12,
        display: 'flex', gap: 4, zIndex: 10,
      }}>
        {AD_ITEMS.map((_, i) => (
          <div
            key={i}
            onClick={(e) => { e.stopPropagation(); setIndex(i); }}
            style={{
              width: i === index ? 14 : 5,
              height: 5, borderRadius: 999,
              background: i === index ? '#F4C430' : 'rgba(255,255,255,0.45)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AdBanner;
