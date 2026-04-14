import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';

const JobDetailsScreen = ({ setActive, jobData }) => {
  // Use passed data or fallback
  const job = jobData || {
    id: '1',
    title: 'Warehouse Associate',
    company: 'Genie Logistics',
    location: 'Madipakkam, Chennai',
    wage: '₹700/day',
    type: 'Day',
    description: 'Help in unloading shipments and sorting packages at our central warehouse. Previous experience is a plus but not mandatory.',
    requirements: ['Physical fitness', 'Aadhaar Card', 'Android Phone'],
    tasks: ['Unload truck', 'Sort packages', 'Update inventory', 'Scan barcodes'],
    startTime: '09:00 AM',
    duration: '8 Hours'
  };

  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApply = () => {
    setLoading(true);
    setTimeout(() => {
      setApplied(true);
      setLoading(false);
      // Optional: redirect to My Jobs after a delay
      setTimeout(() => setActive('My Jobs'), 1500);
    }, 1200);
  };

  return (
    <div className="fade-in" style={{ height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Visual Header */}
      <div style={{ height: 180, background: '#1A1A3E', position: 'relative', flexShrink: 0 }}>
        <div 
          onClick={() => setActive('Find Job')}
          style={{ position: 'absolute', top: 20, left: 20, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
          <span style={{ color: '#fff', fontSize: 18 }}>←</span>
        </div>
        <div style={{ position: 'absolute', bottom: -30, left: 20, width: 70, height: 70, background: 'linear-gradient(135deg, #5B3FC8, #3B82F6)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          📦
        </div>
      </div>

      <div className="full-height-scroll" style={{ padding: '45px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>{job.title}</div>
            <div style={{ fontSize: 14, color: '#5B3FC8', fontWeight: 700, marginTop: 4 }}>{job.company}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#22c55e' }}>{job.wage}</div>
            <div style={{ fontSize: 10, color: '#888', fontWeight: 600, marginTop: 2 }}>DAILY PAYOUT</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <div style={{ background: '#F3F4F6', borderRadius: 12, padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#555' }}>📍 {job.location}</div>
          <div style={{ background: '#F3F4F6', borderRadius: 12, padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#555' }}>⏰ {job.startTime}</div>
          <div style={{ background: '#F3F4F6', borderRadius: 12, padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#555' }}>⏱️ {job.duration}</div>
        </div>

        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 10 }}>Job Description</div>
          <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, margin: 0 }}>{job.description}</p>
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 12 }}>Requirements</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {job.requirements.map(req => (
              <div key={req} style={{ border: '1.5px solid #F0F0F0', borderRadius: 10, padding: '6px 12px', fontSize: 11, fontWeight: 700, color: '#444' }}>
                ✓ {req}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 12 }}>Key Tasks</div>
          {job.tasks.map((task, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#F5F3FF', color: '#5B3FC8', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 13, color: '#555' }}>{task}</div>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div style={{ height: 120 }} />
      </div>

      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        background: '#fff', 
        padding: '20px', 
        borderTop: '1px solid #f0f0f0',
        zIndex: 50
      }}>
        <div 
          onClick={loading || applied ? null : handleApply}
          className="tap-effect"
          style={{ 
            background: applied ? '#22c55e' : '#5B3FC8', 
            borderRadius: 18, 
            padding: '16px 0', 
            textAlign: 'center', 
            color: '#fff', 
            fontWeight: 800, 
            fontSize: 16,
            boxShadow: applied ? '0 10px 20px rgba(34, 197, 94, 0.2)' : '0 10px 20px rgba(91, 63, 200, 0.2)',
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Applying...' : (applied ? '✅ APPLICATION SENT' : 'APPLY FOR THIS GIG')}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsScreen;
