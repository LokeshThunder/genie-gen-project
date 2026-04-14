import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/aiService';

const EarningsPlannerScreen = ({ setActive, earningsGoal, setEarningsGoal, userXP = 450 }) => {
  const [currentEarnings, setCurrentEarnings] = useState(4200);
  const [forecast, setForecast] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(true);
  
  const progressPercent = Math.min((currentEarnings / (earningsGoal || 15000)) * 100, 100);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoadingForecast(true);
      const data = await aiService.getEarningsForecast(earningsGoal || 15000, userXP);
      setForecast(data);
      setLoadingForecast(false);
    };
    fetchForecast();
  }, [earningsGoal, userXP]);

  const roadmap = [
    { title: "Mobile Bill Paid", amount: 1500, reached: true },
    { title: "Weekly Rent Covered", amount: 4000, reached: true },
    { title: "Savings Milestone", amount: 8000, reached: false },
    { title: "Monthly Target", amount: earningsGoal || 15000, reached: false },
  ];

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg-light)', display: 'flex', flexDirection: 'column' }}>
       {/* Header */}
       <div style={{ padding: '24px 20px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={() => setActive('Earnings')} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20 }}>←</div>
          <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-main)' }}>Smart Planner</div>
       </div>

       <div className="full-height-scroll" style={{ padding: '10px 24px 100px' }}>
          {/* Goal Input Dashboard */}
          <div style={{ background: 'linear-gradient(160deg, var(--primary-purple) 0%, #3A1D7A 100%)', borderRadius: 28, padding: '24px', color: '#fff', marginBottom: 25, boxShadow: '0 10px 30px rgba(91, 63, 200, 0.2)' }}>
             <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8 }}>MONTHLY INCOME GOAL</div>
             <div style={{ fontSize: 36, fontWeight: 900, marginTop: 4 }}>₹{earningsGoal?.toLocaleString() || '15,000'}</div>
             
             <div style={{ marginTop: 25 }}>
                <input 
                  type="range" 
                  min="5000" 
                  max="50000" 
                  step="1000"
                  value={earningsGoal || 15000}
                  onChange={(e) => setEarningsGoal(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#fff', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, marginTop: 8, opacity: 0.6 }}>
                   <span>₹5,000</span>
                   <span>₹50,000</span>
                </div>
             </div>
          </div>

          {/* AI Forecast Card */}
          <div style={{ background: 'var(--card-bg)', borderRadius: 24, padding: '20px', border: '1px solid var(--border-color)', marginBottom: 25, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 15 }}>
                <span style={{ fontSize: 20 }}>🧙‍♂️</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary-purple)' }}>PREMIUM SURGE FORECAST</span>
             </div>
             
             {loadingForecast ? (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                   <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Calculating prediction...</div>
                </div>
             ) : (
                <div className="fade-in">
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                      <div>
                         <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)' }}>ESTIMATED ACHIEVEMENT</div>
                         <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)' }}>{forecast?.expectedDate || 'Near future'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                         <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)' }}>CONFIDENCE</div>
                         <div style={{ fontSize: 16, fontWeight: 900, color: '#22c55e' }}>{forecast?.confidence || 'High'}</div>
                      </div>
                   </div>

                   <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 10 }}>UPCOMING SURGE WINDOWS</div>
                   <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 5 }} className="no-scrollbar">
                      {forecast?.surgeWindows?.map((sw, i) => (
                         <div key={i} style={{ flexShrink: 0, width: 120, background: 'var(--bg-light)', borderRadius: 12, padding: '10px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                               <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-main)' }}>{sw.day}</span>
                               <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary-purple)' }}>{sw.multiplier}</span>
                            </div>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.3 }}>{sw.reason}</div>
                         </div>
                      ))}
                   </div>
                </div>
             )}
          </div>

          {/* Progress Visualizer */}
          <div style={{ marginBottom: 30 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>Journey Progress</h3>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary-purple)' }}>{progressPercent.toFixed(0)}% Completed</span>
             </div>
             <div style={{ height: 12, background: 'var(--border-color)', borderRadius: 10, position: 'relative', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  style={{ height: '100%', background: 'var(--primary-purple)', borderRadius: 10 }}
                />
             </div>
          </div>

          {/* AI Roadmap */}
          <div style={{ marginBottom: 20 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 15 }}>
                <span style={{ fontSize: 20 }}>🧞</span>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>AI Suggested Roadmap</h3>
             </div>

             <div className="roadmap-line" style={{ paddingLeft: 10, borderLeft: '2px dashed var(--border-color)' }}>
                {roadmap.map((m, i) => (
                   <div key={i} style={{ display: 'flex', gap: 20, marginBottom: 25, position: 'relative', zIndex: 1 }}>
                      <div style={{ 
                        width: 32, height: 32, borderRadius: '50%', background: m.reached ? 'var(--primary-purple)' : 'var(--bg-light)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontSize: 12, fontWeight: 900, color: m.reached ? '#fff' : 'var(--text-muted)',
                        border: '4px solid var(--card-bg)',
                        marginLeft: -17,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                      }}>
                         {m.reached ? '✓' : '•'}
                      </div>
                      <div style={{ flex: 1, paddingTop: 4 }}>
                         <div style={{ fontWeight: 800, fontSize: 14, color: m.reached ? 'var(--text-main)' : 'var(--text-muted)' }}>{m.title}</div>
                         <div style={{ fontSize: 12, color: m.reached ? 'var(--primary-purple)' : 'var(--text-muted)', fontWeight: 700 }}>Target: ₹{m.amount.toLocaleString()}</div>
                         {!m.reached && i === 2 && !loadingForecast && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              style={{ marginTop: 10, background: 'rgba(91, 63, 200, 0.05)', borderRadius: 12, padding: '12px', border: '1px dashed var(--primary-purple)' }}>
                               <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-purple)' }}>GENIE ADVICE</div>
                               <div style={{ fontSize: 10, color: 'var(--text-main)', marginTop: 2 }}>{forecast?.advice || 'Stay active!'}</div>
                            </motion.div>
                         )}
                      </div>
                   </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

export default EarningsPlannerScreen;
