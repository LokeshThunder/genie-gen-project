import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      return (
        <div style={{ padding: '32px 24px', background: 'var(--bg)', color: 'var(--text-primary)', height: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <div style={{ width: 80, height: 80, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 24 }}>
            ⚠️
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Sora, sans-serif', marginBottom: 12, letterSpacing: '-0.5px' }}>
            Oops! Something went wrong.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 32, maxWidth: 300 }}>
            We encountered an unexpected issue. Your data is safe. Please restart the app to continue.
          </p>
          
          {isDev && (
            <pre style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: '12px', fontSize: '11px', maxWidth: '100%', overflowX: 'auto', textAlign: 'left', marginBottom: 24, border: '1px solid var(--border)', color: '#DC2626' }}>
              {this.state.error?.toString()}
            </pre>
          )}

          <button 
            onClick={() => window.location.reload()}
            className="tap-effect"
            style={{ padding: '16px 32px', background: 'var(--text-primary)', color: '#FFF', border: 'none', borderRadius: '14px', fontSize: 15, fontWeight: 700, fontFamily: 'Sora, sans-serif', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            Restart App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
