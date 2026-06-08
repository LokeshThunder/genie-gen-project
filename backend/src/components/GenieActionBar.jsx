import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GenieActionBar = ({ activeTab, userRole, suggestions = [], onAction, onVoiceOpen }) => {
  if (suggestions.length === 0) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 100, 
      left: 20, 
      right: 20, 
      zIndex: 100,
      pointerEvents: 'none'
    }}>
      <AnimatePresence>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          style={{ 
            background: 'var(--card-bg)', 
            border: '2px solid var(--primary-purple)', 
            borderRadius: 20, 
            padding: '12px 16px',
            boxShadow: '0 8px 24px rgba(91, 63, 200, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            pointerEvents: 'auto'
          }}
        >
          <div style={{ fontSize: 20 }}>✨</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary-purple)', letterSpacing: 1 }}>GENIE SUGGESTION</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{suggestions[0].text}</div>
          </div>
          <div 
            onClick={() => onAction(suggestions[0])}
            className="tap-effect"
            style={{ 
              background: 'var(--primary-purple)', 
              color: '#fff', 
              padding: '8px 16px', 
              borderRadius: 12, 
              fontSize: 11, 
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {suggestions[0].actionLabel || 'GO'}
          </div>
          
          {/* Voice Assistant Trigger */}
          <div 
            onClick={onVoiceOpen}
            className="tap-effect"
            style={{ 
              width: 44, 
              height: 44, 
              borderRadius: '50%', 
              background: 'var(--bg-light)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: 18, 
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid var(--border-color)'
            }}
          >
            🎙️
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GenieActionBar;
