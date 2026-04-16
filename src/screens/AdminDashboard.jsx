import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NavBar from '../components/NavBar';
import LiquidEther from '../components/LiquidEther/LiquidEther';
import { aiService } from '../services/aiService';
import { FirestoreService } from '../services/firestoreService';

const AdminDashboard = ({ setActive, onEditJob, onCreateJob, jobs = [], applications = [], attendance = [] }) => {
  const [loading, setLoading] = useState(true);
  const [pipelineTab, setPipelineTab] = useState('Pending');
  const [insight, setInsight] = useState("Scanning operational data for magic insights... 🧞");
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const fetchInsight = async () => {
    setIsInsightLoading(true);
    const data = {
      workers: applications.length,
      jobs: jobs.length,
      activity: attendance.length
    };
    const res = await aiService.getAdminInsights(data);
    setInsight(res);
    setIsInsightLoading(false);
  };

  useEffect(() => {
    // Initial fetch of numeric data is handled by real-time streams.
    // We NO LONGER auto-fetch AI insights to prevent blocking/lag on load.
  }, []);

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
          onClick={() => setActive('Jobs')} // Assuming admin can view listings
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
              <div style={{ fontSize: 88, fontWeight: 900, lineHeight: 0.9 }}>{(jobs || []).filter(j => j?.status === 'Live' || j?.status === 'active').length}</div>
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
            <div style={{ fontSize: 32, fontWeight: 900, color: '#302950' }}>{(applications || []).filter(a => a?.status === 'Pending').length}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#5E5680' }}>New applications</div>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #E1D8FF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#40BBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📈</div>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#5E5680', letterSpacing: 1 }}>FULFILL</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#302950' }}>{(jobs || []).length > 0 ? Math.round(((applications || []).length / jobs.length) * 100) : 0}%</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#5E5680' }}>Fulfillment rate</div>
          </div>
        </div>

        {/* AI Intelligence Brief */}
        <div style={{ background: '#111827', borderRadius: 28, padding: '24px', marginBottom: 30, position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, position: 'relative' }}>
            <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 12 }}>
              <span style={{ fontSize: 20 }}>🪄</span>
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>Magic Insights</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>POWERED BY JITRO AI</div>
            </div>
            <div style={{ flex: 1 }} />
            <div 
              onClick={!isInsightLoading ? fetchInsight : null}
              style={{ 
                padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 10, fontWeight: 800, cursor: 'pointer',
                opacity: isInsightLoading ? 0.5 : 1
              }}
            >
              {isInsightLoading ? 'ANALYZING...' : 'REFRESH ⚡'}
            </div>
          </div>
          
          <div style={{ color: '#E5E7EB', fontSize: 14, lineHeight: 1.6, fontWeight: 500, position: 'relative' }}>
            {insight || "Click 'Refresh' to generate real-time operational intel based on current worker and job flow."}
          </div>
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
              {jobs.map(job => (
                <div key={job.id} style={{ background: '#fff', borderRadius: 24, padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #F0F0FF', position: 'relative' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                         <div style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 2 }}>{job.title || 'Untitled Job'}</div>
                         <div style={{ fontSize: 11, color: '#5E5680', fontWeight: 600 }}>{(job.type || 'Standard').toUpperCase().replace('-', ' ')} • {job.workerCount || 0} Slots</div>
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
                         <div style={{ fontSize: 13, fontWeight: 800, color: '#302950' }}>₹{job.wage || 0} <span style={{ fontSize: 10, color: '#BBB' }}>/ {job.workerCount || 1} Nos</span></div>
                      </div>
                      <div style={{ background: '#FAF4FF', padding: '12px', borderRadius: 16 }}>
                         <div style={{ fontSize: 9, fontWeight: 900, color: '#5E5680', letterSpacing: 1, marginBottom: 4 }}>TIMING</div>
                         <div style={{ fontSize: 13, fontWeight: 800, color: '#302950' }}>{(job.startTime || '--:--')} - {(job.endTime || '--:--')}</div>
                      </div>
                   </div>
                   <div style={{ marginTop: 12, fontSize: 10, color: '#BBB', display: 'flex', alignItems: 'center', gap: 4 }}>
                      🕒 {job.startDate || 'No Date'} {job.endDate ? `to ${job.endDate}` : ''}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {applications.filter(a => a.status === 'Pending').length > 0 ? (
                      applications.filter(a => a.status === 'Pending').map(app => (
                        <div key={app.id} style={{ background: '#fff', borderRadius: 20, padding: '16px', border: '1.5px solid #F0F0FF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ fontSize: 24 }}>👤</div>
                              <div>
                                 <div style={{ fontSize: 14, fontWeight: 800 }}>{app.name || 'Worker'}</div>
                                 <div style={{ fontSize: 10, color: '#888' }}>Applying for: {app.jobTitle || 'Gig'}</div>
                              </div>
                           </div>
                           <div style={{ display: 'flex', gap: 8 }}>
                              <button 
                                onClick={async () => {
                                  await FirestoreService.updateApplicationStatus(app.id, 'Approved');
                                  await FirestoreService.initializeTasks(app.id, app.category || 'General');
                                }}
                                style={{ background: '#22C55E', color: '#fff', border: 'none', borderRadius: 10, padding: '6px 12px', fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>APPROVE</button>
                           </div>
                        </div>
                      ))
                   ) : (
                    <div style={{ background: '#fff', borderRadius: 24, border: '2px dashed #E1D8FF', padding: '48px 20px', textAlign: 'center' }}>
                      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F4EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32 }}>📥</div>
                      <div style={{ fontWeight: 800, color: '#302950', fontSize: 15 }}>No pending applications</div>
                      <div style={{ color: '#5E5680', fontSize: 11, marginTop: 4 }}>When people apply, they will appear here.</div>
                    </div>
                   )}
                </div>
              ) : pipelineTab === 'Active' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {applications.filter(a => ['Approved', 'Active'].includes(a.status)).length > 0 ? (
                      applications.filter(a => ['Approved', 'Active'].includes(a.status)).map(app => (
                        <div key={app.id} style={{ background: '#fff', borderRadius: 20, padding: '16px', border: '1.5px solid #F0F0FF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 40, height: 40, borderRadius: 12, background: app.status === 'Active' ? '#DCFCE7' : '#F4EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                {app.status === 'Active' ? '🏃' : '✅'}
                              </div>
                              <div>
                                 <div style={{ fontSize: 14, fontWeight: 800 }}>{app.name}</div>
                                 <div style={{ fontSize: 10, color: app.status === 'Active' ? '#22C55E' : '#888', fontWeight: 700 }}>{app.status.toUpperCase()}</div>
                              </div>
                           </div>
                           <div style={{ display: 'flex', gap: 8 }}>
                              <button 
                                onClick={() => FirestoreService.markAbsent(app.id)}
                                style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FEE2E2', borderRadius: 10, padding: '6px 12px', fontSize: 9, fontWeight: 900, cursor: 'pointer' }}>ABSENT</button>
                              <button 
                                onClick={() => FirestoreService.completeApplication(app.id, app.workerId)}
                                style={{ background: '#4647D3', color: '#fff', border: 'none', borderRadius: 10, padding: '6px 12px', fontSize: 9, fontWeight: 900, cursor: 'pointer' }}>COMPLETE</button>
                           </div>
                        </div>
                      ))
                   ) : (
                    <div style={{ background: '#fff', borderRadius: 24, border: '2px dashed #E1D8FF', padding: '48px 20px', textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, color: '#302950', fontSize: 15 }}>No active workers</div>
                    </div>
                   )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {applications.filter(a => a.status === 'Completed').length > 0 ? (
                      applications.filter(a => a.status === 'Completed').map(app => (
                        <div key={app.id} style={{ background: '#fff', borderRadius: 20, padding: '16px', border: '1.5px solid #F0F0FF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ fontSize: 24 }}>🏆</div>
                              <div>
                                 <div style={{ fontSize: 14, fontWeight: 800 }}>{app.name}</div>
                                 <div style={{ fontSize: 10, color: '#888' }}>{app.jobTitle} • Payment Processed</div>
                              </div>
                           </div>
                           <div style={{ fontSize: 14, fontWeight: 900, color: '#22C55E' }}>₹{app.wage || '---'}</div>
                        </div>
                      ))
                   ) : (
                    <div style={{ background: '#fff', borderRadius: 24, border: '2px dashed #E1D8FF', padding: '48px 20px', textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, color: '#302950', fontSize: 15 }}>No completed jobs yet</div>
                    </div>
                   )}
                </div>
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
            {applications.length > 0 ? applications.map((w, i) => (
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
                     <div style={{ fontSize: 9, fontWeight: 900, color: '#4647D3' }}>{(w.status || 'Pending').toUpperCase()}</div>
                     <div style={{ fontSize: 8, color: '#BBB' }}>ID: {w.id?.slice(-6) || 'N/A'}</div>
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

        {/* Live Operations Pulse Feed */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#302950', margin: 0 }}>Live Operations</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
               <span className="pulse-active-green" style={{ width: 8, height: 8, background: '#22C55E', borderRadius: '50%' }} />
               <span style={{ fontSize: 10, fontWeight: 800, color: '#22C55E', letterSpacing: 1 }}>LIVE</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(() => {
              // Consolidate and sort events chronologically
              const appEvents = applications.map(app => ({
                id: `app_${app.id}`,
                type: 'application',
                timestamp: app.appliedAt?.toDate ? app.appliedAt.toDate() : new Date(app.appliedAt || Date.now()),
                title: app.name || 'Worker',
                subtitle: `Applied: ${app.jobTitle || 'Gig'}`,
                icon: '📄',
                status: app.status
              }));

              const attendanceEvents = attendance.map(att => ({
                id: `att_${att.id}`,
                type: 'attendance',
                timestamp: att.updatedAt?.toDate ? att.updatedAt.toDate() : new Date(att.updatedAt || Date.now()),
                title: att.worker || 'Worker',
                subtitle: att.concludedStatus === 'IN PROGRESS' ? `Current: ${att.role || 'On Site'}` : `Completed: ${att.role || 'Shift'}`,
                icon: att.concludedStatus === 'IN PROGRESS' ? '🏃' : '✅',
                status: att.concludedStatus || 'Active',
                isActive: att.concludedStatus === 'IN PROGRESS'
              }));

              const allEvents = [...appEvents, ...attendanceEvents].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

              if (allEvents.length === 0) {
                return (
                  <div style={{ padding: '48px 20px', textAlign: 'center', background: '#fff', borderRadius: 28, border: '2px dashed #E1D8FF' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
                    <div style={{ fontWeight: 800, color: '#302950', fontSize: 15 }}>No operational pulse yet</div>
                    <div style={{ color: '#5E5680', fontSize: 11, marginTop: 4 }}>Real-time activity will appear here as it happens.</div>
                  </div>
                );
              }

              return (
                <AnimatePresence>
                  {allEvents.map((event, idx) => (
                    <motion.div 
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{ 
                        background: '#fff', 
                        borderRadius: 24, 
                        padding: '16px 20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 16,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                        border: '1px solid #F0F0FF',
                        position: 'relative'
                      }}
                    >
                      <div style={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: 16, 
                        background: event.type === 'application' ? '#EEF2FF' : (event.isActive ? '#DCFCE7' : '#F4EEFF'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        position: 'relative'
                      }}>
                        {event.icon}
                        {event.isActive && (
                          <span 
                            className="pulse-active-green" 
                            style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, background: '#22C55E', border: '3px solid #fff', borderRadius: '50%' }} 
                          />
                        )}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontWeight: 900, fontSize: 15, color: '#111' }}>{event.title}</div>
                          <div style={{ fontSize: 9, fontWeight: 700, color: '#BBB' }}>
                            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: '#5E5680', marginTop: 2 }}>{event.subtitle}</div>
                      </div>

                      <div style={{ 
                        padding: '6px 10px', 
                        borderRadius: 10, 
                        background: event.isActive ? '#DCFCE7' : '#F3F4F6', 
                        color: event.isActive ? '#166534' : '#5E5680',
                        fontSize: 9,
                        fontWeight: 900
                      }}>
                        {event.status.toUpperCase()}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              );
            })()}
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
