import React from 'react';
import { motion } from 'framer-motion';

/**
 * Per-screen error boundary.
 * Catches crashes in individual screens without taking down the whole app.
 * Shows a friendly recovery UI with the screen name and a retry button.
 */
class ScreenErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log for debugging — replace with a real error reporting service in production
    console.error(`[ScreenErrorBoundary] Screen "${this.props.screenName}" crashed:`, error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { screenName = 'This screen', onGoHome } = this.props;
    const isDev = import.meta.env.DEV;

    return (
      <div style={{
        height: '100%',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      }}>
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={{
            width: 72, height: 72,
            borderRadius: 22,
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, marginBottom: 20,
          }}
        >
          😵
        </motion.div>

        {/* Title */}
        <div style={{
          fontSize: 18, fontWeight: 800,
          color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif',
          marginBottom: 8, letterSpacing: '-0.3px',
        }}>
          Something went wrong
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 13, color: 'var(--text-muted)',
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1.5, marginBottom: 28,
          maxWidth: 260,
        }}>
          {screenName} ran into an unexpected error. Your data is safe — tap below to try again.
        </div>

        {/* Dev-only error detail */}
        {isDev && this.state.error && (
          <div style={{
            background: '#FFF5F5',
            border: '1px solid #FECACA',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 20,
            fontSize: 11,
            color: '#DC2626',
            fontFamily: 'monospace',
            textAlign: 'left',
            maxWidth: '100%',
            overflowX: 'auto',
            wordBreak: 'break-word',
          }}>
            {this.state.error.toString()}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
          <button
            onClick={this.handleRetry}
            style={{
              background: 'var(--text-primary)', color: '#FFF',
              border: 'none', borderRadius: 14,
              padding: '14px 0', fontSize: 14,
              fontWeight: 700, fontFamily: 'Sora, sans-serif',
              cursor: 'pointer', width: '100%',
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            }}
          >
            Try again
          </button>

          {onGoHome && (
            <button
              onClick={onGoHome}
              style={{
                background: 'transparent', color: 'var(--text-muted)',
                border: '1.5px solid var(--border)', borderRadius: 14,
                padding: '13px 0', fontSize: 14,
                fontWeight: 600, fontFamily: 'Inter, sans-serif',
                cursor: 'pointer', width: '100%',
              }}
            >
              Go to Home
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default ScreenErrorBoundary;
