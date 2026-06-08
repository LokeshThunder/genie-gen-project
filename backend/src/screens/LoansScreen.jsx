import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import { motion, AnimatePresence } from 'framer-motion';

const GoldCard = ({ t = {} }) => (
  <div className="cred-card" style={{
    background: 'linear-gradient(135deg, #FDFCF0 0%, #FFFBEB 100%)',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid #E6DFBC'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', marginBottom: 28, zIndex: 1 }}>
      <div>
        <div style={{ color: '#C9A84C', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.genie_credit || 'Genie Credit'}</div>
        <div style={{ fontSize: 15, color: 'var(--text-primary)', marginTop: 2, fontWeight: 700 }}>{t.personal_line || 'Personal Line'}</div>
      </div>
      <div style={{ width: 44, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #0D0D0D, #404040)' }} />
    </div>

    <div style={{ fontSize: 20, color: 'var(--text-primary)', letterSpacing: 3, marginBottom: 28, fontFamily: 'monospace', position: 'relative', zIndex: 1, fontWeight: 700 }}>
      •••• •••• •••• 7291
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
      <div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t.operator || 'Operator'}</div>
        <div style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 700 }}>{t.genie_user || 'Genie User'}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{t.limit || 'Limit'}</div>
        <div style={{ fontSize: 20, color: 'var(--text-primary)', fontWeight: 800 }}><bdi>{t.limit_amount || '₹1.0L'}</bdi></div>
      </div>
    </div>
  </div>
);

const EligibilityRow = ({ icon, label, value, met }) => (
  <div className="cred-card" style={{
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '16px', marginBottom: 12,
    border: met ? '1.5px solid #16A34A' : '1px solid var(--border)',
    background: met ? '#DCFCE7' : '#FFFFFF',
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
      background: 'var(--bg-subtle)',
      border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
    }}>{met ? '✓' : icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 700 }}><bdi>{label}</bdi></div>
      <div style={{ fontSize: 11, color: met ? '#16A34A' : '#9B9B9B', fontWeight: 500 }}><bdi>{value}</bdi></div>
    </div>
    <div style={{ fontSize: 18 }}>{met ? '✅' : '⏳'}</div>
  </div>
);

const KYCUploadBox = ({ icon, label, subtitle, uploaded, onUpload, t = {} }) => (
  <div
    onClick={onUpload}
    className="tap-effect cred-card"
    style={{
      background: 'var(--bg-card)',
      border: uploaded ? '1.5px solid #16A34A' : '1px solid var(--border)',
      padding: '16px',
      display: 'flex', alignItems: 'center', gap: 14,
      marginBottom: 12, cursor: 'pointer',
    }}>
    <div style={{
      width: 44, height: 44, borderRadius: 10, flexShrink: 0,
      background: uploaded ? '#16A34A' : '#FAFAFA',
      border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
      color: uploaded ? '#FFFFFF' : '#0D0D0D',
    }}>{uploaded ? '✓' : icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 700 }}><bdi>{label}</bdi></div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
        <bdi>{uploaded ? (t.verified || 'Verified') : subtitle}</bdi>
      </div>
    </div>
    <div style={{ fontSize: 20, color: uploaded ? '#16A34A' : '#9B9B9B', fontWeight: 700 }}>{uploaded ? '✓' : '+'}</div>
  </div>
);

const LoansScreen = ({ setActive, t = {} }) => {
  const [step, setStep] = useState(0);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [uploads, setUploads] = useState({ aadhaar: false, pan: false, photo: false });
  const [applying, setApplying] = useState(false);
  const [loanAmount, setLoanAmount] = useState(5000);
  const [applicationId] = useState(() => '#GGL-' + Math.floor(10000 + Math.random() * 90000));

  const handleCheckEligibility = () => {
    setCheckingEligibility(true);
    setTimeout(() => {
      setCheckingEligibility(false);
      setEligible(true);
      setStep(1);
    }, 1500);
  };

  const handleUpload = (key) => {
    setUploads(prev => ({ ...prev, [key]: true }));
  };

  const allUploaded = uploads.aadhaar && uploads.pan && uploads.photo;

  const handleApply = () => {
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      setStep(3);
    }, 2000);
  };

  const formatAmount = (n) => '₹' + n.toLocaleString('en-IN');

  const STEPS_LABELS = [
    t.details_step || 'Details',
    t.eligibility_step || 'Eligibility',
    t.kyc_step || 'KYC',
    t.done_step || 'Done'
  ];

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
       {/* Header */}
       <div style={{ 
         padding: 'var(--header-pad) 20px 16px', 
         flexShrink: 0, 
         display: 'flex', 
         alignItems: 'center', 
         gap: 12, 
         zIndex: 10,
         background: 'var(--bg-card)',
         borderBottom: '1px solid var(--border-light)'
       }}>
          <div
            onClick={() => step === 0 ? setActive('Home') : setStep(s => s - 1)}
            className="tap-effect"
            style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text-primary)', fontWeight: 700, background: 'var(--bg-subtle)' }}>
            ←
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t.credit_title || 'Credit'}</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, marginTop: 2 }}>{t.credit_subtitle || 'Quick and easy financial support'}</div>
          </div>
       </div>

      {/* Step Indicator */}
      {step < 3 && (
        <div style={{ padding: '20px 16px 8px', display: 'flex', gap: 12, flexShrink: 0, background: 'var(--bg-subtle)' }}>
          {STEPS_LABELS.slice(0, 3).map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div style={{ height: 4, borderRadius: 999, background: i <= step ? '#0D0D0D' : 'var(--border)', marginBottom: 6 }} />
              <div style={{ fontSize: 10, color: i <= step ? '#0D0D0D' : '#9B9B9B', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center', letterSpacing: 0.5 }}><bdi>{s}</bdi></div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '16px', background: 'var(--bg)' }}>

        {step === 0 && (
          <div className="fade-in">
            <GoldCard t={t} />

            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <div className="cred-section-label" style={{ marginBottom: 12 }}>select amount</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <div style={{ fontSize: 32, color: 'var(--text-primary)', fontWeight: 800 }}>{formatAmount(loanAmount)}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>{t.max_amount || 'Max ₹1.0L'}</div>
              </div>
              <div className="cred-card" style={{ padding: '16px 20px', background: 'var(--bg-card)' }}>
                <input
                  type="range" min={5000} max={100000} step={5000}
                  value={loanAmount}
                  onChange={e => setLoanAmount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0D0D0D', cursor: 'pointer', height: 6 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
              {[
                {
                  label: t.int_rate || 'Int Rate',
                  value: '16% p.a.'
                },
                { label: t.tenure || 'Tenure', value: '12 Mo' },
                { label: t.proc_fee || 'Proc Fee', value: 'Nil' },
              ].map(s => (
                <div key={s.label} className="cred-card" style={{ padding: '14px 8px', textAlign: 'center', background: 'var(--bg-card)' }}>
                  <div style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 700 }}><bdi>{s.value}</bdi></div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}><bdi>{s.label}</bdi></div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleCheckEligibility}
              className="cred-btn-black"
              style={{ width: '100%', padding: '16px' }}
              disabled={checkingEligibility}
            >
              {checkingEligibility ? (t.processing || 'Processing...') : (t.verify_eligibility || 'Check Credit Eligibility')}
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="fade-in" style={{ position: 'relative' }}>
            <div className="cred-card" style={{ padding: '24px 20px', marginBottom: 20, textAlign: 'center', background: 'var(--bg-card)' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
              <div style={{ fontSize: 20, color: 'var(--text-primary)', fontWeight: 800 }}>{t.eligible || "You're Eligible!"}</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 13, fontWeight: 500 }}>{t.qualify_gold || 'You qualify for the Gold credit limit.'}</div>
            </div>

            <EligibilityRow icon="📊" label={t.cibil_score || "CIBIL Score"} value={t.cibil_status || "Index: 742 — Good"} met={true} />
            <EligibilityRow icon="💼" label={t.work_history || "Work History"} value={t.work_history_status || "12 Gigs completed"} met={true} />
            <EligibilityRow icon="🪪" label={t.identity || "Identity"} value={t.identity_status || "Pending upload"} met={false} />

            <button onClick={() => setStep(2)} className="cred-btn-black" style={{ width: '100%', padding: '16px', marginTop: 16 }}>
              {t.verify_id || 'Verify ID'} ➔
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <div style={{ paddingLeft: 2, marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{t.verify_your_id || 'Verify your ID'}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, marginTop: 2 }}>{t.secure_verification || 'Encrypted secure verification.'}</p>
            </div>

            <KYCUploadBox t={t} icon="🪪" label={t.aadhaar_card || "Aadhaar Card"} subtitle={t.front_back_req || "Front & Back photo"} uploaded={uploads.aadhaar} onUpload={() => handleUpload('aadhaar')} />
            <KYCUploadBox t={t} icon="🗂️" label={t.pan_card || "PAN Card"} subtitle={t.clear_scan_req || "PAN details check"} uploaded={uploads.pan} onUpload={() => handleUpload('pan')} />
            <KYCUploadBox t={t} icon="🤳" label={t.selfie || "Selfie"} subtitle={t.live_face_req || "Face match validation"} uploaded={uploads.photo} onUpload={() => handleUpload('photo')} />

            <button 
              onClick={allUploaded && !applying ? handleApply : undefined}
              className="cred-btn-black"
              style={{ width: '100%', padding: '16px', marginTop: 24, opacity: allUploaded ? 1 : 0.5 }}
              disabled={!allUploaded || applying}
            >
              {applying ? (t.submitting || 'Submitting...') : (t.finalize || 'Submit Application')}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="fade-in" style={{ textAlign: 'center', paddingTop: 28 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 20px', border: '1px solid #BBF7D0' }}>
              ✓
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{t.done || 'Done!'}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 14, fontWeight: 500 }}>{t.app_submitted || 'Your application is under review.'}</p>

            <div className="cred-card" style={{ padding: '20px', marginBottom: 28, textAlign: 'left', background: 'var(--bg-card)' }}>
              {[
                { label: t.application_id || 'Application ID', value: applicationId },
                { label: t.requested || 'Requested', value: formatAmount(loanAmount) },
                { label: t.status || 'Status', value: t.processing_status || 'In Progress' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}><bdi>{r.label}</bdi></span>
                  <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 700 }}><bdi>{r.value}</bdi></span>
                </div>
              ))}
            </div>

            <button onClick={() => setActive('Home')} className="cred-btn-black" style={{ width: '100%', padding: '16px' }}>
              {t.back_to_dashboard || 'Back to Dashboard'}
            </button>
          </div>
        )}
      </div>
      <NavBar active="Home" setActive={setActive} t={t} />
    </div>
  );
};

export default LoansScreen;
