import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NavBar from '../components/NavBar';
import LiquidEther from '../components/LiquidEther/LiquidEther';
import { aiService } from '../services/aiService';

const WORKERS_DATA = [];

const ACTIVITY_DATA = [];

const POSTED_JOBS_DATA = [];

const AdminDashboard = ({ setActive, onEditJob, onCreateJob }) => {
  const [loading, setLoading] = useState(true);
  const [pipelineTab, setPipelineTab] = useState('Pending');
  const [insight, setInsight] = useState("Scanning operational data for magic insights... 🧞");
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const fetchInsight = async () => {
    setIsInsightLoading(true);
    const data = {
      workers: WORKERS_DATA.length,
      jobs: POSTED_JOBS_DATA.length,
      activity: ACTIVITY_DATA.length
    };
    const res = await aiService.getAdminInsights(data);
    setInsight(res);
    setIsInsightLoading(false);
  };

  useEffect(() => {
    if (!loading) fetchInsight();
  }, [loading]);

  const renderSkeleton = () => (
    <div className="full-height-scroll" style={{ padding: '20px' }}>
      <div className="skeleton" style={{ height: 40, width: '60%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 24 }} />
      <div className="skeleton" style={{ height: 180, borderRadius: 24, marginBottom: 20 }} />
      <div className="grid grid-cols-2 gap-4 mb-24">
        <div className="skeleton" style={{ height: 100, borderRadius: 20 }} />
        <div className="skeleton" style={{ height: 100, borderRadius: 20 }} />
      </div>
    </div>
  );

  if (loading) return (
    <div className="fade-in" style={{ height: '100%', background: '#FAF4FF', display: 'flex', flexDirection: 'column' }}>
       {/* Header */}
       <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #4647D3, #9396FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14 }}>OC</div>
          <div style={{ fontWeight: 900, fontSize: 18, color: '#4647D3', letterSpacing: -1 }}>OpCenter</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🔍</span>
          <span style={{ fontSize: 20 }}>🔔</span>
        </div>
      </div>
      {renderSkeleton()}
      <NavBar active="Home" setActive={setActive} isAdmin={true} />
    </div>
  );

  return (
    <div className="fade-in" style={{ height: '100%', background: '#FAF4FF', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* TopAppBar */}
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderBottom: '1px solid #F0F0FF', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #4647D3, #9396FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14, boxShadow: '0 4px 12px rgba(70,71,211,0.2)' }}>OC</div>
          <h1 style={{ fontWeight: 900, fontSize: 18, color: '#4647D3', letterSpacing: -1, margin: 0 }}>OpCenter</h1>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', color: '#4A5167' }}>
          <span className="tap-effect" style={{ fontSize: 20, cursor: 'pointer' }}>🔍</span>
          <span className="tap-effect" style={{ fontSize: 20, cursor: 'pointer' }}>🔔</span>
          <div 
            onClick={() => setActive('Profile')}
            className="tap-effect" 
            style={{ width: 34, height: 34, borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', border: '1px solid #E1D8FF' }}>
            👤
          </div>
        </div>
      </div>

      <div className="full-height-scroll" style={{ padding: '24px 20px 100px' }}>
        
        {/* Welcome Header */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 30, fontWeight: 900, color: '#302950', letterSpacing: -0.5, lineHeight: 1.1 }}>Welcome back,<br />Command</h2>
          <p style={{ color: '#5E5680', fontWeight: 600, fontSize: 13, marginTop: 6 }}>Your operations are running at peak efficiency.</p>
        </div>

        {/* Pulse Dashboard Hero */}
        <div 
          onClick={() => setActive('Find Job')} // Assuming admin can view listings
          className="tap-effect"
          style={{ 
            padding: '28px', 
            borderRadius: 24, 
            background: '#040014', 
            color: '#fff', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: 24,
            minHeight: 220
          }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
             <LiquidEther />
          </div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: 12 }}>⚡</span>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>LIVE PULSE</span>
            </div>
            <h3 style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>Active Recruiting</h3>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16 }}>
              <div style={{ fontSize: 88, fontWeight: 900, lineHeight: 0.9 }}>0</div>
              <div style={{ background: '#fff', color: '#4647D3', padding: '12px 20px', borderRadius: 25, fontSize: 12, fontWeight: 800, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                View All Positions <span>→</span>
              </div>
            </div>
          </div>
        </div>

        {/* Small Stat Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #E1D8FF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#DAE2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📄</div>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#5E5680', letterSpacing: 1 }}>TODAY</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#302950' }}>0</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#5E5680' }}>New applications</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #E1D8FF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#40BBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📈</div>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#5E5680', letterSpacing: 1 }}>FULFILL</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#302950' }}>0%</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#5E5680' }}>Fulfillment rate</div>
          </div>
        </div>

        {/* Bento: Magic Insight */}
        <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: 24, position: 'relative', marginBottom: 28, minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '2px solid var(--primary-purple)', boxShadow: '0 8px 30px rgba(70,71,211,0.05)' }}>
          <div 
            onClick={fetchInsight}
            className="tap-effect"
            style={{ position: 'absolute', top: 20, right: 20, width: 44, height: 44, background: '#F4EEFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', fontSize: 20, cursor: 'pointer', opacity: isInsightLoading ? 0.5 : 1 }}>
            {isInsightLoading ? '⏳' : '🪄'}
          </div>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary-purple)', letterSpacing: 2, marginBottom: 12 }}>MAGIC INSIGHT</div>
          <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.4, marginBottom: 8, maxWidth: '85%' }}>
            {insight}
          </h4>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>Powered by Jitro Engine • Real-time operational analysis</p>
        </div>

        {/* Magic Create CTA */}
        <div 
          onClick={onCreateJob}
          className="tap-effect"
          style={{ background: '#1F1B3D', padding: '32px', borderRadius: 24, textAlign: 'center', position: 'relative', overflow: 'hidden', cursor: 'pointer', marginBottom: 24 }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
          <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>➕</div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Magic Create</h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 24px' }}>Post a new assignment in 10 seconds using AI assistance.</p>
          <div style={{ background: '#fff', color: '#1F1B3D', padding: '14px 28px', borderRadius: 25, fontSize: 13, fontWeight: 800, display: 'inline-block' }}>Start Creation</div>
        </div>

        {/* Posted Jobs Section */}
        <div style={{ marginBottom: 40 }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#302950', margin: 0 }}>Posted Jobs</h3>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#4647D3', cursor: 'pointer' }}>HISTORY ↗</span>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {POSTED_JOBS_DATA.map(job => (
                <div key={job.id} style={{ background: '#fff', borderRadius: 24, padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #F0F0FF', position: 'relative' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                         <div style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 2 }}>{job.title}</div>
                         <div style={{ fontSize: 11, color: '#5E5680', fontWeight: 600 }}>{job.type.toUpperCase().replace('-', ' ')} • {job.workerCount} Slots</div>
                      </div>
                      <div 
                        onClick={() => onEditJob(job)} 
                        className="tap-effect"
                        style={{ background: '#EEF2FF', padding: '6px 14px', borderRadius: 12, fontSize: 11, fontWeight: 800, color: '#4647D3', cursor: 'pointer' }}>
                        EDIT ✎
                      </div>
                   </div>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={{ background: '#FAF4FF', padding: '12px', borderRadius: 16 }}>
                         <div style={{ fontSize: 9, fontWeight: 900, color: '#5E5680', letterSpacing: 1, marginBottom: 4 }}>WAGE / SLOTS</div>
                         <div style={{ fontSize: 13, fontWeight: 800, color: '#302950' }}>₹{job.wage} <span style={{ fontSize: 10, color: '#BBB' }}>/ {job.workerCount} Nos</span></div>
                      </div>
                      <div style={{ background: '#FAF4FF', padding: '12px', borderRadius: 16 }}>
                         <div style={{ fontSize: 9, fontWeight: 900, color: '#5E5680', letterSpacing: 1, marginBottom: 4 }}>TIMING</div>
                         <div style={{ fontSize: 13, fontWeight: 800, color: '#302950' }}>{job.startTime} - {job.endTime}</div>
                      </div>
                   </div>
                   <div style={{ marginTop: 12, fontSize: 10, color: '#BBB', display: 'flex', alignItems: 'center', gap: 4 }}>
                      🕒 {job.startDate} {job.endDate ? `to ${job.endDate}` : ''}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Pipeline Overview */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#302950', margin: 0 }}>Pipeline Overview</h3>
          </div>
          <div style={{ background: '#ECE4FF', padding: '4px', borderRadius: 25, display: 'inline-flex', marginBottom: 20 }}>
            {['Pending', 'Active', 'Completed'].map(tab => (
              <div 
                key={tab}
                onClick={() => setPipelineTab(tab)}
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: 20, 
                  fontSize: 11, 
                  fontWeight: 800, 
                  cursor: 'pointer',
                  background: pipelineTab === tab ? '#fff' : 'transparent',
                  color: pipelineTab === tab ? '#4647D3' : '#5E5680',
                  boxShadow: pipelineTab === tab ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}>
                {tab.toUpperCase()}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={pipelineTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}>
              {pipelineTab === 'Pending' ? (
                <div style={{ background: '#fff', borderRadius: 24, border: '2px dashed #E1D8FF', padding: '48px 20px', textAlign: 'center' }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F4EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32 }}>📥</div>
                  <div style={{ fontWeight: 800, color: '#302950', fontSize: 15 }}>No pending applications</div>
                  <div style={{ color: '#5E5680', fontSize: 11, marginTop: 4 }}>When people apply, they will appear here.</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#5E5680', fontSize: 12 }}>Showing {pipelineTab} pipeline details...</div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Workforce Overview */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#302950', margin: 0 }}>Workforce Overview</h3>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#4647D3', cursor: 'pointer' }}>VIEW ALL ↗</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {WORKERS_DATA.length > 0 ? WORKERS_DATA.map((w, i) => (
              <div key={i} className="tap-effect" style={{ background: '#fff', padding: '12px 16px', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #F0F0FF', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F4EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{w.img}</div>
                   <div>
                     <div style={{ fontWeight: 800, fontSize: 14, color: '#111' }}>{w.name}</div>
                     <div style={{ fontSize: 10, color: '#5E5680' }}>{w.role} • {w.rating} Rating</div>
                   </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                   <div style={{ textAlign: 'right' }}>
                     <div style={{ fontSize: 9, fontWeight: 900, color: '#4647D3' }}>{w.status.toUpperCase()}</div>
                     <div style={{ fontSize: 8, color: '#BBB' }}>ID: {w.id}</div>
                   </div>
                   <div style={{ color: '#BBB', fontSize: 18 }}>›</div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: 12, background: '#fff', borderRadius: 20, border: '1px solid #F0F0FF' }}>
                No workers registered in your pool yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: '#302950', marginBottom: 20 }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {ACTIVITY_DATA.length > 0 ? ACTIVITY_DATA.map(act => (
              <div key={act.id} style={{ background: '#fff', borderRadius: 24, padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #F0F0FF' }}>
                <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid #F0F0FF', paddingBottom: 16, marginBottom: 16 }}>
                   <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FAF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{act.img}</div>
                   <div style={{ flex: 1 }}>
                     <div style={{ fontWeight: 800, fontSize: 15, color: '#111' }}>{act.worker}</div>
                     <div style={{ fontSize: 11, color: '#5E5680' }}>{act.role} • ID: {act.workerId}</div>
                   </div>
                   <div style={{ background: act.status.includes('PAYMENT') ? '#F0FDF4' : '#F4EEFF', color: act.status.includes('PAYMENT') ? '#166534' : '#4647D3', padding: '6px 12px', borderRadius: 20, fontSize: 9, fontWeight: 900, alignSelf: 'flex-start' }}>
                      {act.status}
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                   <div>
                     <div style={{ fontSize: 9, fontWeight: 900, color: '#5E5680', letterSpacing: 1, marginBottom: 6 }}>SHIFT COMMENCED</div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                       <span style={{ fontSize: 20, fontWeight: 900, color: '#111' }}>{act.commenced.split(' ')[0]}</span>
                       <span style={{ fontSize: 10, fontWeight: 700, color: '#BBB' }}>{act.commenced.split(' ')[1]}</span>
                       <span style={{ fontSize: 8, fontWeight: 900, color: '#6366F1', background: '#EEF2FF', padding: '2px 6px', borderRadius: 4 }}>{act.commencedStatus}</span>
                     </div>
                     <div style={{ fontSize: 10, color: '#5E5680', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>📍</span> {act.commencedLoc}
                     </div>
                   </div>
                   <div>
                     <div style={{ fontSize: 9, fontWeight: 900, color: '#5E5680', letterSpacing: 1, marginBottom: 6 }}>SHIFT CONCLUDED</div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                       <span style={{ fontSize: 20, fontWeight: 900, color: act.concluded === '--:--' ? '#BBB' : '#111' }}>{act.concluded.split(' ')[0]}</span>
                       <span style={{ fontSize: 10, fontWeight: 700, color: '#BBB' }}>{act.concluded.split(' ')[1] || ''}</span>
                       <span style={{ fontSize: 8, fontWeight: 900, color: act.concludedStatus === 'IN PROGRESS' ? '#166534' : '#DCFCE7', background: act.concludedStatus === 'IN PROGRESS' ? '#DCFCE7' : '#FFF7ED', padding: '2px 6px', borderRadius: 4 }}>{act.concludedStatus}</span>
                     </div>
                     <div style={{ fontSize: 10, color: '#5E5680', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>{act.concluded === '--:--' ? '🕒' : '📍'}</span> {act.concludedLoc}
                     </div>
                   </div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#888', fontSize: 13, background: '#fff', borderRadius: 24, border: '1px solid #F0F0FF' }}>
                No recent activity to show.
              </div>
            )}
          </div>
        </div>

      </div>

      <NavBar active="Home" setActive={setActive} isAdmin={true} />

      {/* FAB (Desktop Replacement for creating from any tab) */}
      <div 
        onClick={onCreateJob}
        className="tap-effect"
        style={{ position: 'absolute', right: 20, bottom: 90, width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #4647D3, #9396FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 32, boxShadow: '0 8px 25px rgba(70,71,211,0.3)', zIndex: 100, cursor: 'pointer' }}>
        +
      </div>
    </div>
  );
};

export default AdminDashboard;
