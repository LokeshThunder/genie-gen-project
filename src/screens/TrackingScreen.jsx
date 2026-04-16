import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const TrackingScreen = ({ setActive }) => {
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isHeatmapMode, setIsHeatmapMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapScale, setMapScale] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [focusWorkerId, setFocusWorkerId] = useState(null);
  
  // Real-time Data State
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

  // Pincode-to-Map Centering Logic
  useEffect(() => {
    if (searchQuery.length === 6 && /^\d+$/.test(searchQuery)) {
      const prefix = searchQuery.substring(0, 2);
      const zone = SURGE_ZONES.find(z => z.code === prefix);
      
      if (zone) {
        // Center on the zone (simulated by offset)
        setMapOffset({ 
          x: (50 - zone.long) * 2, 
          y: (50 - zone.lat) * 2 
        });
        setMapScale(1.5);
        setTimeout(() => {
           alert(`📍 Operational focus shifted to ${zone.label} (${searchQuery})`);
        }, 500);
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
    
    // Auto-clear focus animation after 3 units of time
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
      status: app.status,
      // Simulated coordinates for now since application docs don't have lat/long
      lat: 20 + Math.random() * 60,
      long: 20 + Math.random() * 60,
      workerId: app.workerId
    }));

    const attendanceEvents = attendance.map(att => ({
      id: `att_${att.id}`,
      type: 'attendance',
      timestamp: att.updatedAt?.toDate ? att.updatedAt.toDate() : new Date(att.updatedAt || Date.now()),
      title: att.worker || 'Worker',
      subtitle: att.concludedStatus === 'IN PROGRESS' ? `Current: ${att.role || 'On Site'}` : `Completed: ${att.role || 'Shift'}`,
      icon: att.concludedStatus === 'IN PROGRESS' ? '🏃' : '✅',
      status: att.concludedStatus || 'Active',
      isActive: att.concludedStatus === 'IN PROGRESS',
      lat: att.lat || (30 + Math.random() * 40),
      long: att.long || (30 + Math.random() * 40),
      workerId: att.workerId
    }));

    return [...appEvents, ...attendanceEvents].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  }, [applications, attendance]);

  return (
    <div className="fade-in" style={{ height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      <style>{`
        @keyframes pulseHeat { 0%,100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.2); opacity: 0.6; } }
      `}</style>

      {/* Header Overlaid on Map */}
      <div style={{ position: 'absolute', top: 20, left: 15, right: 15, zIndex: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div 
          onClick={() => setActive('Home')}
          className="tap-effect"
          style={{ width: 44, height: 44, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
        >
          <span style={{ fontSize: 18 }}>←</span>
        </div>
        <div style={{ flex: 1, background: '#fff', borderRadius: 14, padding: '10px 16px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#111' }}>{isHeatmapMode ? 'Surge Map' : 'Live Tracking'}</div>
            <div style={{ fontSize: 9, color: isHeatmapMode ? '#ef4444' : '#22c55e', fontWeight: 800 }}>{isHeatmapMode ? '🔥 3 SURGE AREAS' : '● 3 WORKERS ONLINE'}</div>
          </div>
          <div 
            onClick={() => setIsHeatmapMode(!isHeatmapMode)}
            style={{ 
              width: 40, height: 40, borderRadius: 10, 
              background: isHeatmapMode ? '#ef4444' : '#f3f4f6', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              cursor: 'pointer', color: isHeatmapMode ? '#fff' : '#111',
              transition: 'all 0.3s'
            }}
          >
            {isHeatmapMode ? '📡' : '🔥'}
          </div>
        </div>
      </div>

      {/* Simulated Map Background */}
      <motion.div 
        animate={{ 
          scale: mapScale,
          x: mapOffset.x,
          y: mapOffset.y
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        style={{ 
          flex: 1, 
          background: isHeatmapMode ? '#111827' : '#e5e7eb', 
          backgroundImage: isHeatmapMode 
            ? 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)' 
            : 'radial-gradient(#d1d5db 1px, transparent 1px)', 
          backgroundSize: '30px 30px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'background 0.5s'
        }}>
        <HeatmapOverlay show={isHeatmapMode} />

        {/* Dynamic Activity Points (Simulated from actual Pulse Data) */}
        {!isHeatmapMode && allEvents.map((evt) => (
           <motion.div 
            key={evt.id + '_point'}
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ 
              position: 'absolute', top: `${evt.lat}%`, left: `${evt.long}%`,
              width: 40, height: 40, marginLeft: -20, marginTop: -20,
              background: evt.type === 'application' ? 'radial-gradient(circle, #6366F1 0%, transparent 70%)' : 'radial-gradient(circle, #22C55E 0%, transparent 70%)',
              borderRadius: '50%', zIndex: 6
            }}
           />
        ))}

        {/* Worker Pins */}
        {!isHeatmapMode && workers.map(w => (
          <div 
            key={w.id}
            onClick={() => setSelectedWorker(w)}
            className={focusWorkerId === w.id ? "map-pin-pulse" : ""}
            style={{ 
              position: 'absolute', 
              top: `${w.lat}%`, 
              left: `${w.long}%`, 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'all 0.3s',
              zIndex: 8
            }}
          >
            <div style={{ 
              background: '#fff', 
              borderRadius: 12, 
              padding: '4px 8px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              fontSize: 10,
              fontWeight: 800,
              marginBottom: 4,
              whiteSpace: 'nowrap',
              border: `1.5px solid ${w.status === 'Active' ? '#22c55e' : '#F59E0B'}`
            }}>
              {w.name.split(' ')[0]}
            </div>
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: '50%', 
              background: w.status === 'Active' ? '#22c55e' : '#F59E0B', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '2px solid #fff',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}>
              <span style={{ fontSize: 16 }}>{w.img}</span>
            </div>
          </div>
        ))}

        {/* Selected Worker Info Overlay */}
        <AnimatePresence>
          {selectedWorker && !isHeatmapMode && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              style={{ 
                position: 'absolute', 
                bottom: 30, left: 15, right: 15, 
                background: '#fff', 
                borderRadius: 24, 
                padding: '20px', 
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                zIndex: 20
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 50, height: 50, borderRadius: 16, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                      {selectedWorker.img}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>{selectedWorker.name}</div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Warehouse Associate · Shift: 09:00 - 18:00</div>
                    </div>
                 </div>
                 <div 
                  onClick={() => setSelectedWorker(null)}
                  style={{ fontSize: 18, color: '#ccc', cursor: 'pointer' }}
                 >✕</div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                <div style={{ flex: 1, background: '#F9FAFB', borderRadius: 14, padding: '12px', border: '1px solid #F0F0F0' }}>
                   <div style={{ fontSize: 9, fontWeight: 700, color: '#888', marginBottom: 2 }}>STATUS</div>
                   <div style={{ fontSize: 12, fontWeight: 800, color: selectedWorker.status === 'Active' ? '#22c55e' : '#F59E0B' }}>● {selectedWorker.status.toUpperCase()}</div>
                </div>
                <div style={{ flex: 1, background: '#F9FAFB', borderRadius: 14, padding: '12px', border: '1px solid #F0F0F0' }}>
                   <div style={{ fontSize: 9, fontWeight: 700, color: '#888', marginBottom: 2 }}>BATTERY</div>
                   <div style={{ fontSize: 12, fontWeight: 800, color: '#111' }}>🔋 84%</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
                 <div className="tap-effect" style={{ flex: 1, background: '#6366F1', borderRadius: 14, padding: '14px 0', textAlign: 'center', color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
                    📞 CALL WORKER
                 </div>
                 <div className="tap-effect" style={{ width: 52, borderRadius: 14, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    💬
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Pulse Operations Drawer */}
      {!selectedWorker && (
        <motion.div 
          initial={{ y: '70%' }}
          animate={{ y: isHeatmapMode ? '100%' : '0%' }}
          style={{ 
            background: '#fff', 
            borderRadius: '24px 24px 0 0',
            boxShadow: '0 -10px 25px rgba(0,0,0,0.08)',
            zIndex: 15,
            padding: '16px 20px 40px',
            maxHeight: '40%',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <div style={{ width: 40, height: 4, background: '#E5E7EB', borderRadius: 2 }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#302950' }}>Pulse Operations</div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#22C55E' }}>LIVE FEED</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {allEvents.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: 11 }}>
                Awaiting operational pulse...
              </div>
            ) : allEvents.map((event) => (
              <motion.div 
                key={event.id}
                onClick={() => handlePulseFocus(event.workerId, event.lat, event.long)}
                className="tap-effect"
                style={{ 
                  background: '#F9FAFB', 
                  borderRadius: 16, 
                  padding: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  border: focusWorkerId === event.workerId ? '1.5px solid #6366F1' : '1.5px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: 18 }}>{event.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 12, color: '#111' }}>{event.title}</div>
                  <div style={{ fontSize: 10, color: '#5E5680' }}>{event.subtitle}</div>
                </div>
                <div style={{ fontSize: 8, fontWeight: 900, color: '#BBB' }}>
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Persistent Search overlay if drawer is low */}
      {!selectedWorker && !isHeatmapMode && (
         <div style={{ position: 'absolute', bottom: 10, left: 15, right: 15, zIndex: 16 }}>
             <div style={{ background: '#fff', borderRadius: 14, padding: '10px 14px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14 }}>📍</span>
              <input 
                placeholder="Jump to Pincode..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12 }}
              />
            </div>
         </div>
      )}
    </div>
  );
};

export default TrackingScreen;
