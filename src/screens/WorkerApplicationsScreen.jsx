import React, { useState } from 'react';

const WorkerApplicationsScreen = ({ setActive }) => {
  const [applications, setApplications] = useState([]);

  const handleAction = (id, action) => {
    // Simulate API call
    setApplications(prev => prev.filter(app => app.id !== id));
    alert(`Worker ${action === 'approve' ? 'Approved' : 'Rejected'} successfully!`);
  };

  return (
    <div className="fade-in" style={{ height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 10px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div 
          onClick={() => setActive('Home')}
          style={{ width: 32, height: 32, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <span style={{ fontSize: 14 }}>←</span>
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>Worker Applications</div>
          <div style={{ fontSize: 12, color: '#888' }}>Active Hiring Campaign</div>
        </div>
      </div>

      <div className="full-height-scroll" style={{ padding: '15px 20px' }}>
        {applications.length > 0 ? applications.map(app => (
          <div key={app.id} style={{ 
            background: '#fff', 
            border: '1.5px solid #F0F0F0', 
            borderRadius: 24, 
            padding: '20px', 
            marginBottom: 15,
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: 18, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>
                {app.img}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>{app.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: '#F59E0B' }}>⭐ {app.rating}</span>
                  <span style={{ color: '#eee' }}>|</span>
                  <span style={{ fontSize: 11, color: '#888' }}>{app.exp} Exp</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 15 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#888', marginBottom: 8 }}>SKILLS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {app.skills.map(s => (
                  <span key={s} style={{ background: '#F3F4F6', borderRadius: 8, padding: '4px 10px', fontSize: 10, fontWeight: 700, color: '#555' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <div 
                onClick={() => handleAction(app.id, 'reject')}
                className="tap-effect"
                style={{ flex: 1, border: '1.5px solid #EF4444', borderRadius: 14, padding: '12px 0', textAlign: 'center', color: '#EF4444', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}
              >
                REJECT
              </div>
              <div 
                onClick={() => handleAction(app.id, 'approve')}
                className="tap-effect"
                style={{ flex: 2, background: '#22c55e', borderRadius: 14, padding: '12px 0', textAlign: 'center', color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}
              >
                APPROVE WORKER
              </div>
            </div>
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#bbb' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>All applications reviewed</div>
            <div style={{ fontSize: 12, marginTop: 5 }}>New applicants will appear here.</div>
          </div>
        )}

        <div style={{ height: 100 }} />
      </div>
    </div>
  );
};

export default WorkerApplicationsScreen;
