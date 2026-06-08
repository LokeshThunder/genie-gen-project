/**
 * LoadingButton.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Button component with built-in loading state, accessible and visually clear.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { motion } from 'framer-motion';

export const LoadingButton = ({
  loading = false,
  disabled = false,
  children,
  loadingText = 'Loading...',
  variant = 'primary',
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`btn btn-${variant} ${className}`}
      disabled={isDisabled}
      aria-busy={loading}
      aria-label={loading ? loadingText : undefined}
      {...props}
    >
      {loading ? (
        <motion.div
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="loading-dots">
            <motion.span
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
            <motion.span
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
            <motion.span
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            />
          </div>
          <span>{loadingText}</span>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {children}
        </motion.div>
      )}
    </button>
  );
};

export default LoadingButton;
