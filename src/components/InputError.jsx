/**
 * InputError.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Accessible error message display for form inputs with ARIA support.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const InputError = ({ message, show = false, id = '' }) => {
  if (!show || !message) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="alert"
          id={id}
          aria-live="polite"
          aria-atomic="true"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 6,
            padding: '8px 12px',
            background: 'var(--red-bg)',
            border: '1px solid #FECACA',
            borderRadius: 'var(--r-sm)',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--red)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span style={{ fontSize: 14 }}>⚠️</span>
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InputError;
