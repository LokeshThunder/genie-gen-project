import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ReportsScreen = ({ setActive }) => {
  const [activeTab, setActiveTab] = useState('ATTENDANCE');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const metrics = [
    { id: 'active', label: 'ACTIVE STAFF', value: '0', trend: '0%', icon: 'groups', col: '#4647D3' },
    { id: 'shift', label: 'AVG SHIFT', value: '0h', trend: '0%', icon: 'timer', col: '#4647D3' },
    { id: 'compliance', label: 'COMPLIANCE', value: '0%', trend: 'Stable', icon: 'verified', col: '#4647D3' }
  ];

  const activities = [];

  if (loading) return (
    <div className="fade-in" style={{ height: '100%', background: '#FAF4FF', padding: '24px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ width: 40, height: 40, background: '#F4EEFF', borderRadius: '50%' }} />
        <div className="skeleton" style={{ height: 28, width: '60%' }} />
      </div>
      <div className="skeleton" style={{ height: 40, borderRadius: 20, marginBottom: 40 }} />
      <div className="skeleton" style={{ height: 200, borderRadius: 24, marginBottom: 20 }} />
    </div>
  );

  return (
    <div className="fade-in" style={{ height: '100%', background: '#FAF4FF', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderBottom: '1px solid #F0F0FF', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={() => setActive('Home')} className="tap-effect" style={{ padding: '8px', cursor: 'pointer' }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#4647D3' }}>≡</span>
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 900, color: '#4647D3', letterSpacing: -0.5, margin: 0 }}>Operational Reports</h1>
        </div>
        <div 
          onClick={() => setActive('Profile')}
          className="tap-effect"
          style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B6B, #FFB88C)', padding: 1, border: '2px solid #9396FF', cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤵</div>
        </div>
      </div>

      <div className="full-height-scroll" style={{ padding: '24px 20px 100px' }}>
        
        {/* Portal Headline */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: '#4647D3', letterSpacing: 1.5, marginBottom: 8 }}>PERFORMANCE PORTAL</div>
          <h2 style={{ fontSize: 34, fontWeight: 900, color: '#302950', lineHeight: 1, margin: 0 }}>Workforce<br /><span style={{ color: '#4647D3' }}>Intelligence</span></h2>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 8, background: '#ECE4FF', padding: '5px', borderRadius: 30, marginBottom: 32, overflowX: 'auto', whiteSpace: 'nowrap' }} className="no-scrollbar">
          {['ATTENDANCE', 'COMPLIANCE', 'WORKFORCE', 'LIVE TRACK'].map(tab => (
            <div 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ padding: '10px 18px', borderRadius: 25, fontSize: 10, fontWeight: 800, color: activeTab === tab ? '#4647D3' : '#5E5680', background: activeTab === tab ? '#fff' : 'transparent', boxShadow: activeTab === tab ? '0 4px 10px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
              {tab}
            </div>
          ))}
        </div>

        {/* Timeline Analytics */}
        <div style={{ background: '#fff', borderRadius: 32, padding: '28px', boxShadow: '0 20px 50px rgba(48,41,80,0.05)', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#302950', margin: 0 }}>TIMELINE ANALYTICS</h3>
              <p style={{ fontSize: 11, color: '#5E5680', margin: '4px 0 0' }}>Real-time engagement tracking across sites</p>
            </div>
            <div style={{ background: '#F4EEFF', borderRadius: 12, padding: '4px 12px', fontSize: 10, fontWeight: 800, color: '#4647D3' }}>THIS WEEK</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             {metrics.map(m => (
               <div key={m.id} style={{ background: '#F4EEFF', borderRadius: 24, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontSize: 24 }}>{m.id === 'active' ? '👥' : m.id === 'shift' ? '⏱️' : '✅'}</div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 900, color: '#5E5680', letterSpacing: 0.5 }}>{m.label}</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#302950' }}>{m.value}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: m.trend.includes('+') ? '#22C55E' : '#4647D3' }}>{m.trend}</div>
               </div>
             ))}
          </div>
        </div>

        {/* Genie Insight Card (Empty for now) */}
        <div style={{ height: 32 }} />

        {/* Recent Activity Feed */}
        <div>
          <h3 style={{ fontSize: 22, fontWeight: 900, color: '#302950', marginBottom: 20 }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {activities.length > 0 ? activities.map((act, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 32, padding: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #F0F0FF' }}>
                <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#FAF4FF', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{act.img}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900, fontSize: 15, color: '#302950' }}>{act.worker}</div>
                    <div style={{ fontSize: 11, color: '#5E5680', fontWeight: 600 }}>{act.role}</div>
                  </div>
                </div>
                
                <div style={{ display: 'inline-flex', background: act.status.includes('PAYMENT') ? '#F0FDF4' : '#F4EEFF', color: act.status.includes('PAYMENT') ? '#166534' : '#4647D3', padding: '6px 14px', borderRadius: 20, fontSize: 10, fontWeight: 900, marginBottom: 24 }}>
                  {act.status}
                </div>

                <div style={{ borderTop: '1px solid #F0F0FF', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 900, color: '#5E5680', letterSpacing: 1, marginBottom: 8 }}>SHIFT COMMENCED</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                      <span style={{ fontSize: 28, fontWeight: 950, color: '#302950' }}>{act.commenced}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#5E5680' }}>{act.commencedAmpm}</span>
                      <span style={{ background: '#F4EEFF', padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 900, color: '#4647D3', marginLeft: 8 }}>{act.commencedType}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#5E5680', fontWeight: 600 }}>📍 {act.commencedLoc}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 900, color: '#5E5680', letterSpacing: 1, marginBottom: 8 }}>SHIFT CONCLUDED</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                      <span style={{ fontSize: 28, fontWeight: 950, color: act.concluded === '--:--' ? '#BBB' : '#302950' }}>{act.concluded}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#5E5680' }}>{act.concludedAmpm}</span>
                      <span style={{ background: act.concludedType === 'IN PROGRESS' ? '#F0FDF4' : '#FFF7ED', padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 900, color: act.concludedType === 'IN PROGRESS' ? '#166534' : '#C2410C', marginLeft: 8 }}>
                        {act.concludedType}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#5E5680', fontWeight: 600 }}>{act.concluded === '--:--' ? '🕒' : '📍'} {act.concludedLoc}</div>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '32px', textAlign: 'center', color: '#888', background: '#fff', borderRadius: 32, border: '1px solid #F0F0FF' }}>
                No activity reports generated yet.
              </div>
            )}
          </div>
        </div>

        <div style={{ height: 40 }} />
      </div>

      <div 
        onClick={() => setActive('Create')}
        className="tap-effect"
        style={{ position: 'fixed', right: 24, bottom: 120, width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #4647D3, #9396FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#fff', boxShadow: '0 8px 30px rgba(70,71,211,0.4)', zIndex: 100, cursor: 'pointer' }}>
        +
      </div>

      {/* Simplified Mobile Bottom Nav (Already handled in App.jsx usually, but we include context) */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: '#fff', borderTop: '1px solid #f0f0f0', display: 'flex', padding: '12px 10px 24px', justifyContent: 'space-around', zIndex: 50 }}>
         {['Home', 'Reports', 'Genie AI', 'Profile'].map(tab => (
           <div key={tab} onClick={() => setActive(tab)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: tab === 'Reports' ? 1 : 0.4 }}>
             <span style={{ fontSize: 22 }}>{tab === 'Home' ? '🏠' : tab === 'Reports' ? '📊' : tab === 'Genie AI' ? '✨' : '👤'}</span>
             <span style={{ fontSize: 9, fontWeight: 800, marginTop: 4 }}>{tab.toUpperCase()}</span>
           </div>
         ))}
      </div>
    </div>
  );
};

export default ReportsScreen;
