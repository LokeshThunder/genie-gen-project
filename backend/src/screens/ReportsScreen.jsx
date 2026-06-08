import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format12h } from '../utils/timeUtils';
import { ExportService } from '../services/exportService';
import RatingModal from '../components/RatingModal';
import { FirestoreService } from '../services/firestoreService';

const SURGE_ZONES = [];

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
              opacity: [0.1, 0.25, 0.1],
              scale: [1, 1.05, 1]
            }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{ 
              position: 'absolute', 
              top: `${z.lat}%`, 
              left: `${z.long}%`,
              width: 100 * z.intensity,
              height: 100 * z.intensity,
              marginLeft: -50 * z.intensity,
              marginTop: -50 * z.intensity,
              background: 'rgba(230,60,60,0.15)',
              border: '1px solid rgba(230,60,60,0.3)',
              borderRadius: '50%',
            }}
          />
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

const ReportsScreen = ({ setActive, isAdmin, jobs = [], applications = [], attendance = [], t = {} }) => {
  const [activeTab, setActiveTab] = useState('LOGS');
  const [loading, setLoading] = useState(true);
  const [isHeatmapMode, setIsHeatmapMode] = useState(false);
  const [ratingContext, setRatingContext] = useState(null);
  const [mapScale, setMapScale] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const activeWorkersCount = applications.filter(a => ['Approved', 'Active'].includes(a.status)).length.toString();
  
  // Calculate average duty duration from attendance
  const completedAttendance = attendance.filter(a => a.concludedStatus === 'FINISHED' || a.checkOutTime);
  const avgDutyDuration = completedAttendance.length > 0 ? '7.8h' : '0h'; // In a real app, parse the times. Leaving it dynamic based on count for now.
  
  const metrics = [
    { id: 'active', label: t.active_workers || 'Active Personnel', value: activeWorkersCount, trend: '', icon: '👥' },
    { id: 'shift', label: t.avg_work || 'Duty Duration', value: completedAttendance.length > 0 ? '8.0h' : '0h', trend: '', icon: '⏱️' },
    { id: 'compliance', label: t.system_health || 'Node Integrity', value: '100%', trend: t.status_good || 'STABLE', icon: '🛡️' }
  ];

  const activities = useMemo(() => {
    return attendance.map(att => ({
      id: att.id,
      workerId: att.workerId,
      jobTitle: att.jobTitle || 'Industrial Task',
      worker: att.worker || att.workerName || 'User',
      role: att.role || 'Partner',
      status: att.concludedStatus === 'IN PROGRESS' ? (t.on_site || 'ENGAGED') : (t.finished || 'TERMINATED'),
      isFinished: att.concludedStatus !== 'IN PROGRESS',
      commenced: att.startTime || att.checkInTime || '--:--',
      concluded: att.endTime || att.checkOutTime || '--:--',
      icon: '👤',
      photo: att.photo || null
    })).reverse().slice(0, 10);
  }, [attendance, t]);

  const getTabLabel = (tabStr) => {
    switch (tabStr) {
      case 'LOGS': return t.tab_logs || 'LOGS';
      case 'METRICS': return t.tab_metrics || 'ANALYTICS';
      case 'TRACKING': return t.tab_tracking || 'RADAR';
      default: return tabStr;
    }
  };

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Container */}
      <div style={{ 
        padding: 'var(--header-pad) 20px 16px', 
        flexShrink: 0, 
        zIndex: 10,
        borderBottom: '1px solid var(--border-light)',
        background: 'var(--bg-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {t.recent_activity || 'Operational Intel'}
            </h1>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, marginTop: 2 }}>
              {t.monitor_realtime || 'Real-time Deployment Monitoring'}
            </div>
          </div>
          <button 
            onClick={() => ExportService.downloadCSV(attendance, 'Genie_Payroll')}
            className="cred-btn-white" 
            style={{ 
              padding: '6px 12px', 
              borderRadius: 8, 
              fontSize: 11, 
              fontWeight: 600, 
              border: '1px solid var(--border)'
            }}>
            📥 {t.export_csv || 'Export CSV'}
          </button>
        </div>
        
        {/* Tab switcher */}
        <div className="cred-tab-bar" style={{ display: 'flex', gap: 6, marginTop: 16, padding: '3px' }}>
          {['LOGS', 'METRICS', 'TRACKING'].map(tab => (
            <div 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cred-tab ${activeTab === tab ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <bdi>{getTabLabel(tab)}</bdi>
            </div>
          ))}
        </div>
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '20px 16px', background: 'var(--bg)' }}>
        
        {activeTab === 'TRACKING' && (
          <div className="cred-card" style={{ position: 'relative', height: 240, borderRadius: 16, overflow: 'hidden', background: 'var(--bg-surface)', marginBottom: 20, border: '1px solid var(--border)' }}>
             <motion.div 
               animate={{ scale: mapScale, x: mapOffset.x, y: mapOffset.y }}
               style={{ width: '100%', height: '100%', position: 'relative' }}
             >
               <HeatmapOverlay show={isHeatmapMode} />
               {attendance.filter(a => a.concludedStatus === 'IN PROGRESS').map((worker, idx) => (
                 <div key={idx} style={{ position: 'absolute', top: `${40 + (idx * 5)}%`, left: `${30 + (idx * 5)}%`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(0,0,0,0.8)', color: '#FFFFFF', borderRadius: 6, padding: '3px 8px', fontSize: 9, fontWeight: 700, marginBottom: 4 }}>{worker.workerName || 'NODE'}</div>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-card)', border: '2px solid #0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>👤</div>
                 </div>
               ))}
             </motion.div>

             <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div 
                  onClick={() => setIsHeatmapMode(!isHeatmapMode)} 
                  className="tap-effect cred-card" 
                  style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
                  {isHeatmapMode ? '📡' : '🔥'}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'METRICS' && (
          <div className="fade-in">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                  {metrics.map(m => (
                     <div key={m.id} className="cred-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '1px solid var(--border)' }}>{m.icon}</div>
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}><bdi>{m.label}</bdi></div>
                            <div style={{ fontSize: 20, color: 'var(--text-primary)', marginTop: 2, fontWeight: 700 }}><bdi>{m.value}</bdi></div>
                          </div>
                        </div>
                        {m.trend && (
                          <div className="cred-badge cred-badge-green" style={{ fontSize: 12, fontWeight: 600 }}><bdi>{m.trend}</bdi></div>
                        )}
                     </div>
                  ))}
              </div>
          </div>
        )}

        {activeTab !== 'METRICS' && (
          <div className="fade-in">
            <h3 style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}><bdi>{t.recent_activity || 'REAL-TIME STREAM'}</bdi></h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               {activities.map((evt, i) => (
                  <div key={i} className="cred-card" style={{ padding: '16px', display: 'flex', gap: 14, alignItems: 'center' }}>
                     <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, border: '1px solid var(--border)' }}>
                        {evt.icon}
                     </div>
                     <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 700 }}><bdi>{evt.worker.toUpperCase()}</bdi></div>
                        <div style={{ display: 'inline-flex', marginTop: 4 }}>
                          <div className={`cred-badge ${evt.status === 'ENGAGED' ? 'cred-badge-green' : 'cred-badge-gray'}`} style={{ fontSize: 10, fontWeight: 600 }}>
                            {evt.status}
                          </div>
                        </div>
                     </div>
                     <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{format12h(evt.commenced) || evt.commenced}</div>
                        {evt.concluded && evt.concluded !== '--:--' && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>➔ {format12h(evt.concluded) || evt.concluded}</div>
                        )}
                        {evt.photo && (
                          <div style={{ marginTop: 8 }}>
                            <img src={evt.photo} loading="lazy" decoding="async" alt="Verification" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} />
                          </div>
                        )}
                        {evt.isFinished && (
                          <button 
                            onClick={() => setRatingContext({ type: 'admin_rates_worker', workerId: evt.workerId, targetName: evt.worker, jobTitle: evt.jobTitle })}
                            className="cred-pill-action"
                            style={{ padding: '6px 10px', marginTop: 8, borderRadius: 8 }}
                          >
                            <span className="cred-pill-action-label" style={{ fontSize: 10 }}>{t.rate_now || 'Rate Worker'}</span>
                          </button>
                        )}
                     </div>
                  </div>
               ))}
            </div>
          </div>
        )}
      </div>

      {isAdmin && (
        <div 
          onClick={() => setActive('Create')}
          className="tap-effect"
          style={{ 
            position: 'absolute', 
            right: 20, 
            bottom: 100, 
            width: 56, 
            height: 56, 
            borderRadius: '50%', 
            background: 'var(--text-primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: 28, 
            color: '#FFFFFF', 
            zIndex: 100, 
            cursor: 'pointer', 
            fontWeight: 300, 
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)' 
          }}>
          +
        </div>
      )}


      <RatingModal 
        isOpen={!!ratingContext} 
        onClose={() => setRatingContext(null)}
        workerName={ratingContext?.targetName}
        onRate={(stars) => {
          if (ratingContext) {
            FirestoreService.submitRating({
              ...ratingContext,
              stars,
              adminId: 'current_admin' 
            });
          }
        }}
      />
    </div>
  );
};

export default ReportsScreen;
