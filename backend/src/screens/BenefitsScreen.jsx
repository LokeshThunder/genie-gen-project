import React from 'react';
import NavBar from '../components/NavBar';

const BenefitsScreen = ({ setActive, t = {} }) => {
  return (
    <div className="fade-in" style={{ height: "100%", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ 
        padding: 'var(--header-pad) 20px 16px', 
        flexShrink: 0, 
        zIndex: 10,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div 
            onClick={() => setActive("Home")}
            className="tap-effect"
            style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text-primary)', fontWeight: 700, background: 'var(--bg-subtle)' }}>
            ←
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t.benefits_title || 'Benefits'}</h1>
        </div>
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: "20px 16px", background: "var(--bg)" }}>
        {/* Hero */}
        <div style={{ marginBottom: 20, paddingLeft: 2 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.worker_benefits || 'Worker Benefits'}</div>
          <div style={{ fontSize: 22, color: 'var(--text-primary)', lineHeight: 1.3, fontWeight: 800 }}>{t.benefits_subtitle || 'Your safety and health are our priority.'}</div>
        </div>

        {/* Member Status */}
        <div className="cred-card" style={{ padding: "16px", display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, background: "#FFFBEB", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: '1px solid #FDE68A' }}>
            <span style={{ fontSize: 20 }}>⭐</span>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.membership_status || 'Membership Status'}</div>
            <div style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 700 }}>{t.silver_partner || 'Silver Partner'}</div>
          </div>
        </div>

        {/* Card: Accidental Work Cover */}
        <div className="cred-card" style={{ padding: "20px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, background: 'var(--bg-subtle)', border: '1.5px solid var(--border)', borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🛡️</div>
            <div className="cred-badge cred-badge-gray" style={{ border: '1px solid var(--border)' }}>{t.coming_soon || 'Coming Soon'}</div>
          </div>
          <div style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 2, fontWeight: 700 }}>{t.accidental_work_cover || 'Accidental Work Cover'}</div>
          <div style={{ color: 'var(--text-muted)', marginBottom: 14, fontSize: 12, fontWeight: 500 }}>{t.provider || 'Provider'}: JobGenie Shield</div>
          
          <div style={{ background: 'var(--bg-subtle)', borderRadius: 12, padding: '14px', border: '1px solid var(--border)', marginBottom: 16 }}>
            {[(t.coverage_1l || "₹1,00,000 Coverage"), (t.instant_claim_help || "Instant Claim Help"), (t.family_support || "Family Support")].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ color: "#2ECC71", fontSize: 14, fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
          <button className="cred-pill-action" style={{ width: '100%', justifyContent: 'center' }} disabled>
            <span className="cred-pill-action-label">{t.coming_soon || 'Coming Soon'}</span>
          </button>
        </div>

        {/* Card: Healthcare Plan */}
        <div className="cred-card" style={{ padding: "20px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, background: 'var(--bg-subtle)', border: '1.5px solid var(--border)', borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏥</div>
            <div className="cred-badge cred-badge-gray" style={{ border: '1px solid var(--border)' }}>{t.coming_soon || 'Coming Soon'}</div>
          </div>
          <div style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 2, fontWeight: 700 }}>{t.healthcare_plan || 'Healthcare Plan'}</div>
          <div style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 12, fontWeight: 500 }}>{t.provider || 'Provider'}: GenieCare Health</div>
          
          <button className="cred-pill-action" style={{ width: '100%', justifyContent: 'center' }} disabled>
            <span className="cred-pill-action-label">{t.coming_soon || 'Coming Soon'}</span>
          </button>
        </div>

        {/* Wellness Portal */}
        <div className="tap-effect cred-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🌿</span>
            <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 700 }}>{t.wellness_center || 'Wellness Center'}</span>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: 16, fontWeight: 700 }}>→</span>
        </div>
      </div>
      
      <NavBar active="Benefits" setActive={setActive} t={t} />
    </div>
  );
};

export default BenefitsScreen;
