import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NavBar from '../components/NavBar';
import { FirestoreService } from '../services/firestoreService';

const SURGE_ZONES = [
  { id: 'sz1', lat: 35, long: 25, intensity: 0.8, label: 'Chennai South', code: '60' },
  { id: 'sz2', lat: 65, long: 75, intensity: 0.6, label: 'Delhi Hub', code: '11' },
  { id: 'sz3', lat: 20, long: 60, intensity: 0.9, label: 'Mumbai Port', code: '40' },
];

const HeatmapOverlay = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}
      >
        {SURGE_ZONES.map(z => (
          <motion.div 
            key={z.id}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{ 
              position: 'absolute', 
              top: `${z.lat}%`, 
              left: `${z.long}%`,
              width: 150 * z.intensity,
              height: 150 * z.intensity,
              marginLeft: -75 * z.intensity,
              marginTop: -75 * z.intensity,
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.8) 0%, rgba(249, 115, 22, 0.4) 40%, transparent 70%)',
              filter: 'blur(20px)',
              borderRadius: '50%'
            }}
          />
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

const ReportsScreen = ({ setActive, isAdmin, jobs = [], applications = [], attendance = [] }) => {
  const [activeTab, setActiveTab] = useState('ATTENDANCE');
  const [loading, setLoading] = useState(true);
  
  // Tracking Stats
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isHeatmapMode, setIsHeatmapMode] = useState(false);
  const [mapScale, setMapScale] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [focusWorkerId, setFocusWorkerId] = useState(null);
  
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const workers = useMemo(() => {
    return applications
      .filter(a => ['Approved', 'Active'].includes(a.status))
      .map((a, i) => ({
        id: a.id,
        name: a.name || 'Worker',
        img: '👤',
        lat: 20 + (i * 15) % 60,
        long: 20 + (i * 25) % 60,
        status: a.status === 'Active' ? 'Active' : 'Pending'
      }));
  }, [applications]);

  const handlePulseFocus = (workerId, lat, long) => {
    setMapOffset({ 
      x: (50 - long) * 2, 
      y: (50 - lat) * 2 
    });
    setMapScale(1.8);
    setFocusWorkerId(workerId);
    setTimeout(() => setFocusWorkerId(null), 3000);
  };

  const allEvents = useMemo(() => {
    const appEvents = applications.map(app => ({
      id: `app_${app.id}`,
      type: 'application',
      timestamp: app.appliedAt?.toDate ? app.appliedAt.toDate() : new Date(app.appliedAt || Date.now()),
      title: app.name || 'Worker',
      subtitle: `Applied: ${app.jobTitle || 'Gig'}`,
      icon: '📄',
      workerId: app.workerId,
      lat: 20 + Math.random() * 60,
      long: 20 + Math.random() * 60,
    }));

    const attEvents = attendance.map(att => ({
      id: `att_${att.id}`,
      type: 'attendance',
      timestamp: att.updatedAt?.toDate ? att.updatedAt.toDate() : new Date(att.updatedAt || Date.now()),
      title: att.worker || 'Worker',
      subtitle: att.concludedStatus === 'IN PROGRESS' ? 'Checked In' : 'Shift Completed',
      icon: att.concludedStatus === 'IN PROGRESS' ? '🏃' : '✅',
      workerId: att.workerId,
      lat: att.lat || (30 + Math.random() * 40),
      long: att.long || (30 + Math.random() * 40),
    }));

    return [...appEvents, ...attEvents].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  }, [applications, attendance]);

  const metrics = [
    { id: 'active', label: 'ACTIVE STAFF', value: applications.filter(a => ['Approved', 'Active'].includes(a.status)).length.toString(), trend: '+5%', icon: 'groups', col: '#4647D3' },
    { id: 'shift', label: 'AVG SHIFT', value: '7.8h', trend: '+12%', icon: 'timer', col: '#4647D3' },
    { id: 'compliance', label: 'COMPLIANCE', value: '98%', trend: 'Stable', icon: 'verified', col: '#4647D3' }
  ];

  const activities = useMemo(() => {
    return attendance.map(att => ({
      worker: att.worker || 'Worker',
      img: '👤',
      role: att.role || 'Staff',
      status: att.concludedStatus === 'IN PROGRESS' ? 'ON SITE' : 'PAYMENT PROCESSED',
      commenced: att.startTime || '--:--',
      commencedAmpm: 'AM',
      commencedType: 'AUTO',
      commencedLoc: att.location || 'Main Site',
      concluded: att.endTime || '--:--',
      concludedAmpm: 'PM',
      concludedType: att.concludedStatus === 'IN PROGRESS' ? 'IN PROGRESS' : 'AUTO',
      concludedLoc: att.concludedStatus === 'IN PROGRESS' ? 'Active Site' : 'Main Site'
    })).reverse().slice(0, 10);
  }, [attendance]);

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

        {/* Main Content Areas */}
        {activeTab === 'LIVE TRACK' ? (
          <div style={{ position: 'relative', height: 450, borderRadius: 32, overflow: 'hidden', background: isHeatmapMode ? '#111827' : '#e5e7eb', marginBottom: 20, boxShadow: '0 20px 50px rgba(70,71,211,0.1)' }}>
             <motion.div 
               animate={{ scale: mapScale, x: mapOffset.x, y: mapOffset.y }}
               style={{ width: '100%', height: '100%', position: 'relative' }}
             >
               <HeatmapOverlay show={isHeatmapMode} />
               {!isHeatmapMode && workers.map(w => (
                 <div 
                   key={w.id}
                   className={focusWorkerId === w.id ? "map-pin-pulse" : ""}
                   style={{ position: 'absolute', top: `${w.lat}%`, left: `${w.long}%`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                 >
                   <div style={{ background: '#fff', borderRadius: 8, padding: '2px 6px', fontSize: 8, fontWeight: 900, marginBottom: 2 }}>{w.name.split(' ')[0]}</div>
                   <div style={{ width: 24, height: 24, borderRadius: '50%', background: w.status === 'Active' ? '#22c55e' : '#F59E0B', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{w.img}</div>
                 </div>
               ))}
               
               {/* Activity Points */}
               {!isHeatmapMode && allEvents.map((evt) => (
                  <motion.div 
                   key={evt.id + '_pt'}
                   animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   style={{ position: 'absolute', top: `${evt.lat}%`, left: `${evt.long}%`, width: 30, height: 30, marginLeft: -15, marginTop: -15, background: evt.type === 'application' ? 'radial-gradient(circle, #6366F1 0%, transparent 70%)' : 'radial-gradient(circle, #22C55E 0%, transparent 70%)', borderRadius: '50%' }}
                  />
               ))}
             </motion.div>

             {/* Map Controls */}
             <div style={{ position: 'absolute', top: 15, right: 15, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div onClick={() => setIsHeatmapMode(!isHeatmapMode)} style={{ width: 36, height: 36, background: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer' }}>{isHeatmapMode ? '📡' : '🔥'}</div>
             </div>
          </div>
        ) : (
          <>
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
          </>
        )}

        {/* Dynamic Activity/Pulse Feed */}
        <div>
          <h3 style={{ fontSize: 22, fontWeight: 900, color: '#302950', marginBottom: 20 }}>
            {activeTab === 'LIVE TRACK' ? 'Live Pulse Operations' : 'Recent Activity'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeTab === 'LIVE TRACK' ? (
              allEvents.length > 0 ? allEvents.map((evt) => (
                <motion.div 
                  key={evt.id}
                  onClick={() => handlePulseFocus(evt.workerId, evt.lat, evt.long)}
                  className="tap-effect"
                  style={{ background: '#fff', borderRadius: 24, padding: '16px', display: 'flex', alignItems: 'center', gap: 12, border: focusWorkerId === evt.workerId ? '1.5px solid #4647D3' : '1.5px solid transparent', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}
                >
                  <div style={{ fontSize: 20 }}>{evt.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#302950' }}>{evt.title}</div>
                    <div style={{ fontSize: 11, color: '#5E5680' }}>{evt.subtitle}</div>
                  </div>
                  <div style={{ fontSize: 10, color: '#BBB', fontWeight: 900 }}>{new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </motion.div>
              )) : (
                <div style={{ padding: '32px', textAlign: 'center', color: '#888', background: '#fff', borderRadius: 24 }}>No live pulse detected.</div>
              )
            ) : (
              (activities || []).length > 0 ? (activities || []).map((act, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 32, padding: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #F0F0FF' }}>
                  <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                    <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#FAF4FF', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{act?.img || '👤'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 900, fontSize: 15, color: '#302950' }}>{act?.worker || 'Unknown Worker'}</div>
                      <div style={{ fontSize: 11, color: '#5E5680', fontWeight: 600 }}>{act?.role || 'Staff'}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'inline-flex', background: (act?.status || '').includes('PAYMENT') ? '#F0FDF4' : '#F4EEFF', color: (act?.status || '').includes('PAYMENT') ? '#166534' : '#4647D3', padding: '6px 14px', borderRadius: 20, fontSize: 10, fontWeight: 900, marginBottom: 24 }}>
                    {act?.status || 'Active'}
                  </div>

                  <div style={{ borderTop: '1px solid #F0F0FF', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 900, color: '#5E5680', letterSpacing: 1, marginBottom: 8 }}>SHIFT COMMENCED</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                        <span style={{ fontSize: 28, fontWeight: 950, color: '#302950' }}>{act?.commenced || '--:--'}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#5E5680' }}>{act?.commencedAmpm || ''}</span>
                        <span style={{ background: '#F4EEFF', padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 900, color: '#4647D3', marginLeft: 8 }}>{act?.commencedType || 'AUTO'}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#5E5680', fontWeight: 600 }}>📍 {act?.commencedLoc || 'Unknown'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 900, color: '#5E5680', letterSpacing: 1, marginBottom: 8 }}>SHIFT CONCLUDED</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                        <span style={{ fontSize: 28, fontWeight: 950, color: (!act?.concluded || act?.concluded === '--:--') ? '#BBB' : '#302950' }}>{act?.concluded || '--:--'}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#5E5680' }}>{act?.concludedAmpm || ''}</span>
                        <span style={{ background: act?.concludedType === 'IN PROGRESS' ? '#F0FDF4' : '#FFF7ED', padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 900, color: act?.concludedType === 'IN PROGRESS' ? '#166534' : '#C2410C', marginLeft: 8 }}>
                          {act?.concludedType || 'PENDING'}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#5E5680', fontWeight: 600 }}>{(!act?.concluded || act?.concluded === '--:--') ? '🕒' : '📍'} {act?.concludedLoc || 'Active Site'}</div>
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '32px', textAlign: 'center', color: '#888', background: '#fff', borderRadius: 32, border: '1px solid #F0F0FF' }}>
                  No activity reports generated yet.
                </div>
              )
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

      <NavBar active="Reports" setActive={setActive} isAdmin={isAdmin} />
    </div>
  );
};

export default ReportsScreen;
