import React, { useState, useEffect, useMemo } from 'react';

const STEPS = ['Details', 'Eligibility', 'KYC', 'Done'];

const GoldCard = () => (
  <div style={{
    background: 'linear-gradient(135deg, #1a1200 0%, #2d2000 30%, #1a1200 60%, #0d0a00 100%)',
    borderRadius: 22,
    padding: '24px 22px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.25)',
  }}>
    {/* Shimmer overlay */}
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(115deg, transparent 40%, rgba(212,175,55,0.07) 50%, transparent 60%)',
      animation: 'cardShimmer 3s infinite ease-in-out',
    }} />
    {/* Gold glows */}
    <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.22) 0%, transparent 70%)' }} />
    <div style={{ position: 'absolute', bottom: -20, left: -20, width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)' }} />

    {/* Row 1: Logo + Chip */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', marginBottom: 24 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(212,175,55,0.7)', letterSpacing: 2 }}>JOB GENIE</div>
        <div style={{ fontSize: 9, color: 'rgba(212,175,55,0.5)', letterSpacing: 1, marginTop: 1 }}>GOLD WORKFORCE CARD</div>
      </div>
      {/* NFC Chip SVG */}
      <div style={{ width: 32, height: 26, borderRadius: 4, background: 'linear-gradient(135deg, #c8a830, #f0d060, #a07010)', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }} />
    </div>

    {/* Card Number */}
    <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(212,175,55,0.6)', letterSpacing: 4, marginBottom: 20, fontFamily: 'monospace' }}>
      •••• &nbsp;&nbsp;•••• &nbsp;&nbsp;•••• &nbsp;&nbsp;7291
    </div>

    {/* Row 3: Name + Amount */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
      <div>
        <div style={{ fontSize: 8, color: 'rgba(212,175,55,0.45)', letterSpacing: 1.5, marginBottom: 2 }}>CARDHOLDER</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#D4AF37', letterSpacing: 1 }}>JOB GENIE USER</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 8, color: 'rgba(212,175,55,0.45)', letterSpacing: 1.5, marginBottom: 2 }}>CREDIT LIMIT</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#D4AF37' }}>₹0</div>
      </div>
    </div>
  </div>
);

const EligibilityRow = ({ icon, label, value, met }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    background: '#fff', borderRadius: 14,
    padding: '13px 16px', marginBottom: 10,
    border: `1.5px solid ${met ? '#D4AF37' : '#f0f0f0'}`,
    boxShadow: met ? '0 2px 12px rgba(212,175,55,0.1)' : 'none',
    transition: 'all 0.2s',
  }}>
    <div style={{
      width: 38, height: 38, borderRadius: 11, flexShrink: 0,
      background: met ? 'linear-gradient(135deg, #1a1200, #2d2000)' : '#f5f5f5',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
    }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{label}</div>
      <div style={{ fontSize: 10, color: '#888', marginTop: 1 }}>{value}</div>
    </div>
    <div style={{
      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
      background: met ? '#D4AF37' : '#e0e0e0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, color: met ? '#000' : '#aaa', fontWeight: 800,
    }}>{met ? '✓' : '?'}</div>
  </div>
);

const KYCUploadBox = ({ icon, label, subtitle, uploaded, onUpload }) => (
  <div
    onClick={onUpload}
    style={{
      background: uploaded ? 'linear-gradient(135deg, #0d0a00, #1a1200)' : '#fafafa',
      border: `2px dashed ${uploaded ? '#D4AF37' : '#e0e0e0'}`,
      borderRadius: 16, padding: '20px 16px',
      display: 'flex', alignItems: 'center', gap: 14,
      marginBottom: 12, cursor: 'pointer',
      transition: 'all 0.25s',
    }}>
    <div style={{
      width: 46, height: 46, borderRadius: 13, flexShrink: 0,
      background: uploaded ? 'rgba(212,175,55,0.15)' : '#eee',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21,
    }}>{uploaded ? '✅' : icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: uploaded ? '#D4AF37' : '#111' }}>{label}</div>
      <div style={{ fontSize: 10, color: uploaded ? 'rgba(212,175,55,0.6)' : '#999', marginTop: 2 }}>
        {uploaded ? 'Document uploaded successfully' : subtitle}
      </div>
    </div>
    <div style={{ fontSize: uploaded ? 16 : 20, color: uploaded ? '#D4AF37' : '#ccc' }}>
      {uploaded ? '›' : '+'}
    </div>
  </div>
);

const LoansScreen = ({ setActive }) => {
  const [step, setStep] = useState(0);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [uploads, setUploads] = useState({ aadhaar: false, pan: false, photo: false });
  const [applying, setApplying] = useState(false);
  const [loanAmount, setLoanAmount] = useState(5000);
  const applicationId = useMemo(() => '#GGL-' + Math.floor(10000 + Math.random() * 90000), []);

  const handleCheckEligibility = () => {
    setCheckingEligibility(true);
    setTimeout(() => {
      setCheckingEligibility(false);
      setEligible(true);
      setStep(1);
    }, 2200);
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
    }, 2400);
  };

  const formatAmount = (n) => '₹' + n.toLocaleString('en-IN');

  return (
    <div className="fade-in" style={{ height: '100%', background: '#0d0a00', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes cardShimmer { 0%,100% { opacity:0 } 50% { opacity:1 } }
        @keyframes pulseGold { 0%,100% { box-shadow: 0 0 0 0 rgba(212,175,55,0.4) } 50% { box-shadow: 0 0 0 12px rgba(212,175,55,0) } }
        @keyframes rotateSpin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes successPop { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
      `}</style>

      {/* Header */}
      <div style={{ padding: '16px 18px 12px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        <div
          onClick={() => step === 0 ? setActive('Home') : setStep(s => s - 1)}
          className="tap-effect"
          style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#D4AF37', cursor: 'pointer' }}>
          ‹
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#D4AF37' }}>Genie Loans</div>
          <div style={{ fontSize: 10, color: 'rgba(212,175,55,0.5)', marginTop: 1 }}>Instant Workforce Finance</div>
        </div>
        <div style={{ fontSize: 22 }}>✨</div>
      </div>

      {/* Step Indicator */}
      {step < 3 && (
        <div style={{ padding: '12px 18px 8px', display: 'flex', gap: 6, flexShrink: 0 }}>
          {STEPS.slice(0, 3).map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', height: 3, borderRadius: 4, background: i <= step ? '#D4AF37' : 'rgba(212,175,55,0.15)', transition: 'background 0.3s' }} />
              <div style={{ fontSize: 9, color: i <= step ? '#D4AF37' : 'rgba(212,175,55,0.35)', fontWeight: 700, letterSpacing: 0.5 }}>{s.toUpperCase()}</div>
            </div>
          ))}
        </div>
      )}

      {/* Scrollable Content */}
      <div className="full-height-scroll" style={{ padding: '16px 18px 24px' }}>

        {/* ─── STEP 0: DETAILS ─── */}
        {step === 0 && (
          <div>
            <GoldCard />

            <div style={{ marginTop: 22, marginBottom: 18 }}>
              <div style={{ fontSize: 9, color: 'rgba(212,175,55,0.6)', letterSpacing: 1.5, marginBottom: 6 }}>SELECT LOAN AMOUNT</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#D4AF37' }}>{formatAmount(loanAmount)}</div>
                <div style={{ fontSize: 10, color: 'rgba(212,175,55,0.5)' }}>Max ₹1,00,000</div>
              </div>
              <input
                type="range" min={5000} max={100000} step={5000}
                value={loanAmount}
                onChange={e => setLoanAmount(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#D4AF37', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 9, color: 'rgba(212,175,55,0.4)' }}>₹5,000</span>
                <span style={{ fontSize: 9, color: 'rgba(212,175,55,0.4)' }}>₹1,00,000</span>
              </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Interest Rate', value: '1.5% / month' },
                { label: 'Tenure', value: 'Up to 12 months' },
                { label: 'Processing', value: 'Zero fee' },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#D4AF37' }}>{s.value}</div>
                  <div style={{ fontSize: 8, color: 'rgba(212,175,55,0.5)', marginTop: 2, lineHeight: 1.3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(212,175,55,0.7)', marginBottom: 12 }}>Eligibility Requirements</div>
            {[
              { em: '📊', label: 'CIBIL Score', val: '700 or above' },
              { em: '📅', label: 'App Usage', val: 'Minimum 6 months on Job Genie' },
              { em: '🪪', label: 'KYC', val: 'Aadhaar + PAN verification required' },
              { em: '💼', label: 'Work History', val: 'At least 5 completed jobs' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', gap: 11, alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 16 }}>{r.em}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(212,175,55,0.85)' }}>{r.label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(212,175,55,0.45)' }}>{r.val}</div>
                </div>
              </div>
            ))}

            <div
              onClick={checkingEligibility ? undefined : handleCheckEligibility}
              className="tap-effect"
              style={{ marginTop: 24, background: 'linear-gradient(135deg, #D4AF37, #F5C518, #A07010)', borderRadius: 16, padding: '16px 0', textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 20px rgba(212,175,55,0.35)', animation: 'pulseGold 2s infinite' }}>
              {checkingEligibility ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, border: '2.5px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'rotateSpin 0.7s linear infinite' }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#000' }}>Checking Eligibility...</span>
                </div>
              ) : (
                <span style={{ fontSize: 13, fontWeight: 800, color: '#000', letterSpacing: 1 }}>CHECK MY ELIGIBILITY ›</span>
              )}
            </div>
          </div>
        )}

        {/* ─── STEP 1: ELIGIBILITY ─── */}
        {step === 1 && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 18, padding: '16px 18px', marginBottom: 22, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#D4AF37' }}>You're Eligible!</div>
              <div style={{ fontSize: 11, color: 'rgba(212,175,55,0.6)', marginTop: 4 }}>Your profile qualifies for a Genie Gold Loan</div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(212,175,55,0.6)', letterSpacing: 1.2, marginBottom: 14 }}>ELIGIBILITY BREAKDOWN</div>
            <EligibilityRow icon="📊" label="CIBIL Score" value="Your score: 742 — Excellent" met={true} />
            <EligibilityRow icon="📅" label="App Usage" value="8 months on Job Genie" met={true} />
            <EligibilityRow icon="💼" label="Work History" value="12 jobs completed" met={true} />
            <EligibilityRow icon="🪪" label="KYC Status" value="Pending — complete in next step" met={false} />

            <div style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 14, padding: '14px 16px', marginTop: 16, marginBottom: 22 }}>
              <div style={{ fontSize: 10, color: 'rgba(212,175,55,0.5)', marginBottom: 4 }}>APPROVED LOAN AMOUNT</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#D4AF37' }}>{formatAmount(loanAmount)}</div>
              <div style={{ fontSize: 10, color: 'rgba(212,175,55,0.45)', marginTop: 2 }}>At 1.5% monthly interest</div>
            </div>

            <div onClick={() => setStep(2)} className="tap-effect" style={{ background: 'linear-gradient(135deg, #D4AF37, #F5C518, #A07010)', borderRadius: 16, padding: '16px 0', textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 20px rgba(212,175,55,0.35)' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#000', letterSpacing: 1 }}>PROCEED TO KYC ›</span>
            </div>
          </div>
        )}

        {/* ─── STEP 2: KYC ─── */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#D4AF37', marginBottom: 4 }}>KYC Verification</div>
            <div style={{ fontSize: 12, color: 'rgba(212,175,55,0.5)', marginBottom: 22, lineHeight: 1.5 }}>
              Upload your documents to complete verification. Your data is end-to-end encrypted.
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(212,175,55,0.6)', letterSpacing: 1.2, marginBottom: 14 }}>REQUIRED DOCUMENTS</div>
            <KYCUploadBox icon="🪪" label="Aadhaar Card" subtitle="Front & back — JPG or PDF" uploaded={uploads.aadhaar} onUpload={() => handleUpload('aadhaar')} />
            <KYCUploadBox icon="🗂️" label="PAN Card" subtitle="Clear scan — JPG or PDF" uploaded={uploads.pan} onUpload={() => handleUpload('pan')} />
            <KYCUploadBox icon="🤳" label="Selfie / Live Photo" subtitle="Face clearly visible" uploaded={uploads.photo} onUpload={() => handleUpload('photo')} />

            <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 12, padding: '12px 14px', marginTop: 8, marginBottom: 22 }}>
              <div style={{ fontSize: 10, color: 'rgba(212,175,55,0.5)', lineHeight: 1.6 }}>
                🔒 Your documents are processed with 256-bit encryption and are never stored beyond verification.
              </div>
            </div>

            <div
              onClick={allUploaded && !applying ? handleApply : undefined}
              className="tap-effect"
              style={{
                background: allUploaded ? 'linear-gradient(135deg, #D4AF37, #F5C518, #A07010)' : 'rgba(212,175,55,0.15)',
                borderRadius: 16, padding: '16px 0', textAlign: 'center',
                cursor: allUploaded ? 'pointer' : 'not-allowed',
                boxShadow: allUploaded ? '0 4px 20px rgba(212,175,55,0.35)' : 'none',
                transition: 'all 0.3s',
              }}>
              {applying ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, border: '2.5px solid rgba(0,0,0,0.25)', borderTopColor: '#000', borderRadius: '50%', animation: 'rotateSpin 0.7s linear infinite' }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#000' }}>Submitting Application...</span>
                </div>
              ) : (
                <span style={{ fontSize: 13, fontWeight: 800, color: allUploaded ? '#000' : 'rgba(212,175,55,0.4)', letterSpacing: 1 }}>
                  {allUploaded ? 'APPLY NOW ›' : `UPLOAD ALL DOCS TO CONTINUE`}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ─── STEP 3: SUCCESS ─── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20, textAlign: 'center' }}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #F5C518)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 22, animation: 'successPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: '0 0 40px rgba(212,175,55,0.4)' }}>
              🎊
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#D4AF37', marginBottom: 8 }}>Application Submitted!</div>
            <div style={{ fontSize: 13, color: 'rgba(212,175,55,0.55)', lineHeight: 1.6, maxWidth: 280, marginBottom: 28 }}>
              Your Genie Gold Loan application for <strong style={{ color: '#D4AF37' }}>{formatAmount(loanAmount)}</strong> has been received. We'll notify you within 24-48 hours.
            </div>

            <div style={{ width: '100%', background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 18, padding: '20px', marginBottom: 24 }}>
              {[
                { icon: '🆔', label: 'Application ID', value: applicationId },
                { icon: '💰', label: 'Requested Amount', value: formatAmount(loanAmount) },
                { icon: '⏱️', label: 'Decision Timeline', value: '24-48 hours' },
                { icon: '📱', label: 'Notification', value: 'SMS + In-app alert' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{r.icon}</span>
                    <span style={{ fontSize: 11, color: 'rgba(212,175,55,0.55)' }}>{r.label}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#D4AF37' }}>{r.value}</span>
                </div>
              ))}
            </div>

            <div onClick={() => setActive('Home')} className="tap-effect" style={{ width: '100%', background: 'linear-gradient(135deg, #D4AF37, #F5C518, #A07010)', borderRadius: 16, padding: '16px 0', textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 20px rgba(212,175,55,0.35)', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#000', letterSpacing: 1 }}>BACK TO HOME</span>
            </div>
            <div onClick={() => { setStep(0); setUploads({ aadhaar: false, pan: false, photo: false }); }} className="tap-effect" style={{ fontSize: 12, color: 'rgba(212,175,55,0.5)', cursor: 'pointer' }}>
              Apply for another loan
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoansScreen;
