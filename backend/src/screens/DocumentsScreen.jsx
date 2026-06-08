import React from 'react';
import NavBar from '../components/NavBar';

const DocumentsScreen = ({ setActive, t }) => {
  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'var(--header-pad) 20px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={() => setActive('Home')} className="tap-effect" style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>←</div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Documents</h1>
        </div>
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '20px 16px' }}>
        <div className="cred-card" style={{ padding: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: '#F8FAFC', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📄</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Payslip_Oct2023.pdf</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Added Nov 1</div>
          </div>
          <div style={{ color: '#2563EB', fontWeight: 700, fontSize: 12 }}>↓ Download</div>
        </div>
        <div className="cred-card" style={{ padding: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: '#F8FAFC', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📄</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Contract_Agreement.pdf</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Added Jan 15</div>
          </div>
          <div style={{ color: '#2563EB', fontWeight: 700, fontSize: 12 }}>↓ Download</div>
        </div>
      </div>
      <NavBar active="Home" setActive={setActive} t={t} />
    </div>
  );
};

export default DocumentsScreen;
