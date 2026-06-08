import React from 'react';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';

const TrainingScreen = ({ setActive, t }) => {
  const courses = [
    { id: 1, title: 'Warehouse Safety 101', status: 'Completed', color: '#16A34A', bg: '#DCFCE7' },
    { id: 2, title: 'Hazardous Material Handling', status: 'Action Required', color: '#DC2626', bg: '#FEE2E2' },
    { id: 3, title: 'Customer Service Basics', status: 'In Progress (50%)', color: '#D97706', bg: '#FEF3C7' }
  ];

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'var(--header-pad) 20px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={() => setActive('Home')} className="tap-effect" style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>←</div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>{t.training || 'Training & Compliance'}</h1>
        </div>
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '20px 16px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)' }}>Required Modules</h3>
        {courses.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="cred-card" style={{ padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{c.title}</div>
              <div style={{ display: 'inline-block', background: c.bg, color: c.color, padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>{c.status}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</div>
          </motion.div>
        ))}
      </div>
      <NavBar active="Home" setActive={setActive} t={t} />
    </div>
  );
};

export default TrainingScreen;
