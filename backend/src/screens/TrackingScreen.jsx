import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FirestoreService } from '../services/firestoreService';
import NavBar from '../components/NavBar';

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
              opacity: [0.15, 0.35, 0.15],
              scale: [1, 1.15, 1]
            }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{ 
              position: 'absolute', 
              top: `${z.lat}%`, 
              left: `${z.long}%`,
              width: 130 * z.intensity,
              height: 130 * z.intensity,
              marginLeft: -65 * z.intensity,
              marginTop: -65 * z.intensity,
              background: 'var(--text-primary)',
              borderRadius: '50%',
              opacity: 0.2
            }}
          />
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

const getHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const getDeterministicNumber = (str, min, max) => {
  const hash = getHash(str);
  return min + (hash % 1000) / 1000 * (max - min);
};

const TrackingScreen = ({ setActive, isAdmin = true, t = {} }) => {
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isHeatmapMode, setIsHeatmapMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapScale, setMapScale] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [focusWorkerId, setFocusWorkerId] = useState(null);
  
  const [applications, setApplications] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const unsubApps = FirestoreService.streamApplications(setApplications);
    const unsubAttendance = FirestoreService.streamAttendance(setAttendance);
    return () => {
      unsubApps();
      unsubAttendance();
    };
  }, []);

  const workers = [
    { id: 'w1', name: 'Ravi Kumar', img: '🧔', lat: 40, long: 30, status: 'Active' },
    { id: 'w2', name: 'Sunil Singh', img: '👴', lat: 55, long: 45, status: 'Pending' },
    { id: 'w3', name: 'Priya Sharma', img: '👩', lat: 25, long: 65, status: 'Active' },
  ];

  useEffect(() => {
    if (searchQuery.length === 6 && /^\d+$/.test(searchQuery)) {
      const prefix = searchQuery.substring(0, 2);
      const zone = SURGE_ZONES.find(z => z.code === prefix);
      
      if (zone) {
        setMapOffset({ 
          x: (50 - zone.long) * 2, 
          y: (50 - zone.lat) * 2 
        });
        setMapScale(1.5);
      }
    } else if (searchQuery.length === 0) {
      setMapScale(1);
      setMapOffset({ x: 0, y: 0 });
    }
  }, [searchQuery]);

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
    const appEvents = applications.map(app => {
      const idStr = app.id || 'default_app';
      const lat = 20 + getDeterministicNumber(idStr + '_lat', 0, 60);
      const long = 20 + getDeterministicNumber(idStr + '_long', 0, 60);
      const timestamp = app.appliedAt?.toDate 
        ? app.appliedAt.toDate() 
        : (app.appliedAt ? new Date(app.appliedAt) : new Date(1779244600000));
      return {
        id: `app_${idStr}`,
        type: 'application',
        timestamp,
        title: app.name || 'Worker',
        subtitle: `Applied: ${app.jobTitle || 'Job'}`,
        icon: '📄',
        status: app.status,
        lat,
        long,
        workerId: app.workerId
      };
    });

    const attendanceEvents = attendance.map(att => {
      const idStr = att.id || 'default_att';
      const lat = att.lat || (30 + getDeterministicNumber(idStr + '_lat', 0, 40));
      const long = att.long || (30 + getDeterministicNumber(idStr + '_long', 0, 40));
      const timestamp = att.updatedAt?.toDate 
        ? att.updatedAt.toDate() 
        : (att.updatedAt ? new Date(att.updatedAt) : new Date(1779244600000));
      return {
        id: `att_${idStr}`,
        type: 'attendance',
        timestamp,
        title: att.worker || 'Worker',
        subtitle: att.concludedStatus === 'IN PROGRESS' ? `Working: ${att.role || 'On Site'}` : `Finished: ${att.role || 'Shift'}`,
        icon: att.concludedStatus === 'IN PROGRESS' ? '🏃' : '✅',
        status: att.concludedStatus || 'Active',
        isActive: att.concludedStatus === 'IN PROGRESS',
        lat,
        long,
        workerId: att.workerId
      };
    });

    return [...appEvents, ...attendanceEvents].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  }, [applications, attendance]);

  return (
    <>
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* Header Overlaid on Map */}
      <div style={{ position: 'absolute', top: 'calc(var(--safe-area-top, 0px) + 20px)', left: 16, right: 16, zIndex: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div 
          onClick={() => setActive('Home')}
          style={{ width: 44, height: 44, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 700, background: 'var(--bg-card)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          ←
        </div>
        <div className="cred-card" style={{ flex: 1, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div>
            <h1 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}><bdi>{isHeatmapMode ? (t.surge_map || 'Surge Zones') : (t.live_pulse || 'Live Gigs Tracking')}</bdi></h1>
            <div style={{ color: 'var(--text-muted)', marginTop: 2, fontSize: 11, fontWeight: 600 }}><bdi>{isHeatmapMode ? `3 surge locations` : `3 workers live`}</bdi></div>
          </div>
          <button 
            onClick={() => setIsHeatmapMode(!isHeatmapMode)}
            style={{ 
              width: 36, height: 36, borderRadius: '50%', 
              background: isHeatmapMode ? '#0D0D0D' : '#F7F7F5', 
              color: isHeatmapMode ? '#FFFFFF' : '#0D0D0D',
              border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}
          >
            {isHeatmapMode ? '📡' : '🔥'}
          </button>
        </div>
      </div>

      {/* Map Content */}
      <motion.div 
        animate={{ 
          scale: mapScale,
          x: mapOffset.x,
          y: mapOffset.y
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        style={{ 
          flex: 1, 
          background: '#F0F2F5', 
          backgroundImage: 'radial-gradient(var(--border) 1.5px, transparent 1.5px)', 
          backgroundSize: '24px 24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
        <HeatmapOverlay show={isHeatmapMode} />

        {/* Worker Pins */}
        {!isHeatmapMode && workers.map(w => (
          <div 
            key={w.id}
            onClick={() => setSelectedWorker(w)}
            style={{ 
              position: 'absolute', 
              top: `${w.lat}%`, 
              left: `${w.long}%`, 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 10
            }}
          >
            <div className="cred-card" style={{ 
              background: 'var(--bg-card)', 
              color: 'var(--text-primary)',
              borderRadius: 6, 
              padding: '2px 6px', 
              marginBottom: 4,
              border: '1px solid var(--border)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <span style={{ fontSize: 9, fontWeight: 700 }}>{w.name.split(' ')[0]}</span>
            </div>
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: '50%', 
              background: 'var(--bg-card)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: `2px solid ${w.status === 'Active' ? '#16A34A' : '#D97706'}`,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              <span style={{ fontSize: 18 }}>{w.img}</span>
            </div>
          </div>
        ))}

        {/* Selected Worker Info Overlay */}
        <AnimatePresence>
          {selectedWorker && !isHeatmapMode && (
            <motion.div 
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="cred-card"
              style={{ 
                position: 'absolute', 
                bottom: 24, left: 16, right: 16, 
                padding: '20px', 
                zIndex: 30,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <div style={{ display: 'flex', gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                       {selectedWorker.img}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}><bdi>{selectedWorker.name}</bdi></h3>
                      <div className="cred-badge cred-badge-green" style={{ marginTop: 2, fontSize: 9 }}>ACTIVE WORKER</div>
                      <div style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 11, fontWeight: 500 }}><bdi>{t.shift_label || 'Shift:'} 09:00 - 18:00</bdi></div>
                    </div>
                 </div>
                 <div 
                  onClick={() => setSelectedWorker(null)}
                  className="tap-effect"
                  style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, cursor: 'pointer', color: 'var(--text-muted)', background: 'var(--bg-subtle)' }}
                 >✕</div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <div className="cred-card" style={{ flex: 1, background: 'var(--bg-subtle)', padding: '10px', border: '1px solid var(--border)' }}>
                   <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase' }}><bdi>{t.status_label || 'STATUS'}</bdi></div>
                   <div style={{ fontSize: 12, color: '#16A34A', fontWeight: 700 }}><bdi>● {selectedWorker.status}</bdi></div>
                </div>
                <div className="cred-card" style={{ flex: 1, background: 'var(--bg-subtle)', padding: '10px', border: '1px solid var(--border)' }}>
                   <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase' }}><bdi>{t.battery_label || 'ENERGY'}</bdi></div>
                   <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700 }}>🔋 84%</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                 <button className="cred-btn-black" style={{ flex: 1, padding: '12px' }}>
                    {t.call_unit || 'Call Worker'}
                 </button>
                 <button className="cred-pill-action" style={{ width: 48, padding: 0, justifyContent: 'center', borderRadius: 10 }}>
                    💬
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Pulse Operations Drawer */}
      {!selectedWorker && (
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: isHeatmapMode ? '100%' : '0%' }}
          className="cred-card"
          style={{ 
            background: 'var(--bg-card)', 
            borderRadius: '24px 24px 0 0',
            border: '1px solid var(--border)',
            borderBottom: 'none',
            zIndex: 15,
            padding: '16px 20px 120px',
            maxHeight: '40%',
            overflowY: 'auto',
            boxShadow: '0 -8px 24px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 10 }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="cred-section-label" style={{ margin: 0 }}>live activity stream</h3>
            <div className="cred-badge cred-badge-green">{t.live_sync || 'LIVE'}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {allEvents.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>
                <bdi>{t.awaiting_pulse || 'Awaiting activity...'}</bdi>
              </div>
            ) : allEvents.map((event) => (
              <div 
                key={event.id}
                onClick={() => handlePulseFocus(event.workerId, event.lat, event.long)}
                className="tap-effect cred-card"
                style={{ 
                  padding: '12px 16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  cursor: 'pointer',
                  background: 'var(--bg-card)'
                }}
              >
                <div style={{ fontSize: 20 }}>{event.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 700 }}><bdi>{event.title}</bdi></div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginTop: 1 }}><bdi>{event.subtitle}</bdi></div>
                </div>
                <div className="cred-badge cred-badge-gray" style={{ fontSize: 10 }}>
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Search Overlay */}
      {!selectedWorker && !isHeatmapMode && (
         <div style={{ position: 'absolute', bottom: 32, left: 16, right: 16, zIndex: 16 }}>
             <div className="cred-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize: 18, opacity: 0.8 }}>📍</span>
              <input 
                placeholder={t.search_pincode || "Search location Pincode..."} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, padding: 0 }}
              />
            </div>
         </div>
      )}
      <NavBar active="Tracking" setActive={setActive} isAdmin={isAdmin} t={t} />
    </div>
    </>
  );
};

export default TrackingScreen;
