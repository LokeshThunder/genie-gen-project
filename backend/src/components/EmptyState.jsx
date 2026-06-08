/**
 * EmptyState.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Accessible empty state component with icon, title, subtitle, and CTA.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { motion } from 'framer-motion';

export const EmptyState = ({
  icon = '📭',
  title = 'Nothing here yet',
  subtitle = 'Try refreshing or check back later',
  actionLabel = null,
  onAction = null,
  className = '',
}) => {
  return (
    <motion.div
      className={`empty-state ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-label={`${title}. ${subtitle}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-3xl) var(--space-lg)',
        textAlign: 'center',
        minHeight: '240px',
      }}
    >
      <div
        className="empty-state-icon"
        style={{
          fontSize: 48,
          marginBottom: 'var(--space-lg)',
          opacity: 0.6,
        }}
      >
        {icon}
      </div>

      <h2
        className="empty-state-title"
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 6,
          fontFamily: 'Sora, sans-serif',
        }}
      >
        {title}
      </h2>

      <p
        className="empty-state-sub"
        style={{
          fontSize: 13,
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          maxWidth: 240,
          marginBottom: actionLabel ? 'var(--space-lg)' : 0,
        }}
      >
        {subtitle}
      </p>

      {actionLabel && onAction && (
        <button
          className="btn btn-primary"
          onClick={onAction}
          style={{ marginTop: 'var(--space-lg)' }}
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
