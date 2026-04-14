import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SURGE_ZONES = [
  { id: 'sz1', lat: 35, long: 25, intensity: 0.8, label: 'Chennai South' },
  { id: 'sz2', lat: 65, long: 75, intensity: 0.6, label: 'Ambattur Hub' },
  { id: 'sz3', lat: 20, long: 60, intensity: 0.9, label: 'Airport Zone' },
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

  const workers = [
    { id: 'w1', name: 'Ravi Kumar', img: '🧔', lat: 40, long: 30, status: 'Active' },
    { id: 'w2', name: 'Sunil Singh', img: '👴', lat: 55, long: 45, status: 'Pending' },
    { id: 'w3', name: 'Priya Sharma', img: '👩', lat: 25, long: 65, status: 'Active' },
  ];

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
      <div style={{ 
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

        {/* Worker Pins (Dimmed in heatmap mode) */}
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
      </div>
      
      {/* Search/Filter bottom bar */}
      {!selectedWorker && !isHeatmapMode && (
        <div style={{ 
          background: '#fff', 
          padding: '16px 20px 40px', 
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -10px 25px rgba(0,0,0,0.05)',
          zIndex: 15
        }}>
          <div style={{ background: '#F3F4F6', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>🔍</span>
            <input 
              placeholder="Search for a worker..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 13 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingScreen;
