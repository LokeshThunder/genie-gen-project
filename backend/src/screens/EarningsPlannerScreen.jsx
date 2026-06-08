import React, { useState } from 'react';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';

const EarningsPlannerScreen = ({ setActive, t = {} }) => {
  const [earningsGoal, setEarningsGoal] = useState(15000);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [forecast, setForecast] = useState(null);

  const roadmap = [
    { title: t.level_induction || 'BASIC INDUCTION', amount: 5000, reached: true },
    { title: t.level_core || 'CORE PROFICIENCY', amount: 10000, reached: true },
    { title: t.level_elite || 'GENIE ELITE STATUS', amount: 15000, reached: false },
    { title: t.level_command || 'COMMAND GRADE', amount: 25000, reached: false },
  ];

  const currentEarnings = 12450;
  const progressPercent = (currentEarnings / earningsGoal) * 100;

  return (
    <>
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: 'var(--header-pad) 16px 20px', 
        flexShrink: 0, 
        borderBottom: '1px solid var(--cred-border)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        zIndex: 10,
        background: 'var(--bg-card)'
      }}>
        <div
          onClick={() => setActive('Earnings')}
          className="tap-effect"
          style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 800, border: '1px solid var(--cred-border)', cursor: 'pointer' }}>
          ←
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}><bdi>{t.planner_title || 'Planner'}</bdi></h1>
          <div style={{ color: 'var(--cred-text-sub)', fontSize: 12, fontWeight: 600, marginTop: 2 }}><bdi>{t.planner_subtitle || 'Plan your future earnings'}</bdi></div>
        </div>
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '24px 16px' }}>
        
        {/* Goal Selector */}
        <div className="cred-card" style={{ padding: '20px', marginBottom: 24, background: 'var(--bg-card)' }}>
          <div style={{ color: 'var(--cred-text-muted)', marginBottom: 16, fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}><bdi>{t.monthly_goal || 'Your Monthly Goal'}</bdi></div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 20 }}>
            <span style={{ color: 'var(--text-primary)', fontSize: 24, fontWeight: 800 }}>₹</span>
            <span style={{ fontSize: 36, color: 'var(--text-primary)', fontWeight: 800 }}>{earningsGoal.toLocaleString()}</span>
          </div>
          
          <div style={{ padding: '0 4px' }}>
            <input 
              type="range"
              min="5000"
              max="50000"
              step="1000"
              value={earningsGoal}
              onChange={(e) => setEarningsGoal(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#0D0D0D', cursor: 'pointer', height: 8, borderRadius: 4 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--cred-text-muted)', fontWeight: 700 }}>₹5K</span>
              <span style={{ fontSize: 12, color: 'var(--cred-text-muted)', fontWeight: 700 }}>₹50K</span>
            </div>
          </div>
        </div>

        {/* AI Forecast Card */}
        <div className="cred-card" style={{ padding: '20px', marginBottom: 24, border: '1px solid var(--cred-border)', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🧙‍♂️</div>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--cred-text-primary)' }}><bdi>{t.smart_forecast || 'Smart Forecast'}</bdi></span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--cred-border)' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--cred-text-muted)', marginBottom: 4, fontWeight: 700, textTransform: 'uppercase' }}><bdi>{t.estimate || 'Estimate'}</bdi></div>
              <div style={{ fontSize: 16, color: 'var(--cred-text-primary)', fontWeight: 800 }}><bdi>{t.near_future || 'Near Future'}</bdi></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--cred-text-muted)', marginBottom: 4, fontWeight: 700, textTransform: 'uppercase' }}><bdi>{t.confidence || 'Confidence'}</bdi></div>
              <div style={{ fontSize: 12, background: 'var(--text-primary)', color: '#FFF', padding: '6px 12px', borderRadius: 10, fontWeight: 800 }}><bdi>{t.confidence_high || 'HIGH'}</bdi></div>
            </div>
          </div>

          <div style={{ fontSize: 13, color: 'var(--cred-text-muted)', marginBottom: 12, fontWeight: 700, textTransform: 'uppercase' }}><bdi>{t.best_days || 'Best days to work'}</bdi></div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }} className="no-scrollbar">
            {[{id: 'mon', name: t.day_mon || 'Mon'}, {id: 'wed', name: t.day_wed || 'Wed'}, {id: 'sat', name: t.day_sat || 'Sat'}].map((day, i) => (
              <div key={i} className="cred-card" style={{ flexShrink: 0, width: 90, background: 'var(--bg-subtle)', borderRadius: 16, padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 15, color: 'var(--cred-text-primary)', fontWeight: 800 }}><bdi>{day.name}</bdi></span>
                  <span style={{ fontSize: 13, color: 'var(--cred-orange)', fontWeight: 800 }}>1.5x</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--cred-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}><bdi>{t.surge_multiplier || 'Surge'}</bdi></div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Visualizer */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}><bdi>{t.your_journey || 'Your Journey'}</bdi></h3>
            <span style={{ fontSize: 13, color: 'var(--text-primary)', background: 'var(--bg-surface)', padding: '6px 12px', border: '1px solid #0D0D0D', borderRadius: 12, fontWeight: 800 }}><bdi>{progressPercent.toFixed(0)}% {t.reached || 'Reached'}</bdi></span>
          </div>
          <div style={{ height: 16, background: 'var(--bg-surface)', borderRadius: 10, position: 'relative', overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              style={{ height: '100%', background: 'var(--text-primary)', borderRadius: 10 }}
            />
          </div>
        </div>

        {/* AI Roadmap */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, paddingLeft: 4 }}><bdi>{t.roadmap_success || 'Roadmap to Success'}</bdi></h3>

          <div style={{ paddingLeft: 24, borderLeft: '2px solid var(--cred-border)', marginLeft: 12 }}>
            {roadmap.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 24, position: 'relative' }}>
                <div style={{ 
                  width: 32, height: 32, borderRadius: 12, background: m.reached ? '#0D0D0D' : '#FFFFFF', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: 16, fontWeight: 800, color: m.reached ? '#FFF' : 'var(--cred-text-muted)',
                  border: `1px solid ${m.reached ? '#0D0D0D' : 'var(--cred-border)'}`,
                  position: 'absolute',
                  left: -41,
                  flexShrink: 0
                }}>
                  {m.reached ? '✓' : '•'}
                </div>
                <div className="cred-card" style={{ flex: 1, padding: '16px' }}>
                  <div style={{ fontSize: 16, color: 'var(--cred-text-primary)', fontWeight: 800 }}><bdi>{m.title}</bdi></div>
                  <div style={{ fontSize: 13, color: m.reached ? '#0D0D0D' : 'var(--cred-text-muted)', marginTop: 4, fontWeight: 700 }}><bdi>{t.target_amount || 'Target: ₹'}{m.amount.toLocaleString()}</bdi></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <NavBar active="Earnings" setActive={setActive} t={t} />
    </div>
    </>
  );
};

export default EarningsPlannerScreen;
