import React from 'react';
import { motion } from 'framer-motion';
import { SKILL_PATHS } from '../constants/gamification';
import { safeGet } from '../utils/safeGet';

const SkillTreeScreen = ({ setActive, userXP, userLevel, t = {} }) => {
  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: 'var(--header-pad) 20px 16px', 
        zIndex: 10,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            onClick={() => setActive('Home')}
            className="tap-effect"
            style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text-primary)', fontWeight: 700, background: 'var(--bg-subtle)' }}>
            ←
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t.skill_tree_title || 'Career Roadmap'}</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, marginTop: 2 }}>{t.unlock_paths || 'Unlock new work sectors'}</div>
          </div>
        </div>
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '20px 16px', background: 'var(--bg)' }}>
        <div style={{ position: 'relative' }}>
          {/* Vertical Path Line */}
          <div style={{ position: 'absolute', left: 34, top: 12, bottom: 12, width: 2, background: 'var(--border)', zIndex: 0 }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {SKILL_PATHS.map((path, idx) => {
              const isUnlocked = userLevel.level >= path.level;
              return (
                <div key={path.id} style={{ display: 'flex', gap: 16, position: 'relative', zIndex: 1 }}>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{ 
                      width: 70, 
                      height: 70, 
                      borderRadius: 16, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: 28,
                      background: isUnlocked ? '#FFFFFF' : '#FAFAFA',
                      border: isUnlocked ? '2px solid #0D0D0D' : '1.5px dashed #CBD5E1',
                      filter: isUnlocked ? 'none' : 'grayscale(1)',
                      boxShadow: isUnlocked ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                      flexShrink: 0
                    }}
                  >
                    {path.icon}
                  </motion.div>
                  
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: isUnlocked ? '#0D0D0D' : '#9B9B9B' }}>
                        {safeGet(t, path.id) || path.label}
                      </div>
                      {!isUnlocked && (
                        <div className="cred-badge cred-badge-gray" style={{ border: '1px solid var(--border)' }}>
                          Level {path.level}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {path.unlocks.map(unlock => (
                        <div key={unlock} className={`cred-badge ${isUnlocked ? 'cred-badge-green' : 'cred-badge-gray'}`} style={{ border: '1px solid var(--border)' }}>
                          {unlock}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Advice Card */}
        <div className="cred-card" style={{ marginTop: 32, padding: 20, textAlign: 'center', background: '#FFFDF0', border: '1px solid #F9E4A0' }}>
          <h3 className="cred-section-label" style={{ color: '#C9A84C', marginBottom: 6 }}>pro tip</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, margin: 0, lineHeight: 1.4 }}>
            Unlock higher sectors to get 20-40% better wages and unlock premium exclusive badges. Keep earning XP to progress!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SkillTreeScreen;
