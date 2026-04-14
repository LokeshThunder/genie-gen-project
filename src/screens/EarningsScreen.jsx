import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { JobService } from '../services/jobService';

const EarningsScreen = ({ setActive }) => {
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEarnings = async () => {
      setLoading(true);
      const data = await JobService.getEarnings();
      setEarningsData(data);
      setLoading(false);
    };
    loadEarnings();
  }, []);

  return (
    <div className="fade-in" style={{ height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Wallet Header */}
      <div style={{ 
        padding: '30px 20px 25px', 
        background: 'linear-gradient(160deg, #5B3FC8 0%, #3A1D7A 100%)', 
        borderRadius: '0 0 32px 32px',
        color: '#fff',
        flexShrink: 0,
        boxShadow: '0 10px 30px rgba(91, 63, 200, 0.2)'
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, letterSpacing: 1 }}>TOTAL BALANCE</div>
        <div style={{ fontSize: 48, fontWeight: 800, marginTop: 5, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
          <span style={{ fontSize: 24, marginTop: 8 }}>₹</span>
          {loading ? '---' : earningsData?.total.toLocaleString()}
        </div>
        
        <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
          <div className="tap-effect" style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '12px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: 16, marginBottom: 2 }}>💸</div>
            <div style={{ fontSize: 11, fontWeight: 800 }}>WITHDRAW</div>
          </div>
          <div className="tap-effect" style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '12px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: 16, marginBottom: 2 }}>📊</div>
            <div style={{ fontSize: 11, fontWeight: 800 }}>REPORTS</div>
          </div>
        </div>
      </div>

      <div className="full-height-scroll" style={{ padding: '25px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>Recent Payments</div>
          <div style={{ fontSize: 12, color: '#5B3FC8', fontWeight: 700 }}>Filter by month ▾</div>
        </div>

        {loading ? (
          [1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: 75, borderRadius: 18, marginBottom: 12 }} />)
        ) : (
          earningsData?.breakdown.map((item, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 15, 
              padding: '16px', 
              background: '#F9FAFB', 
              border: '1px solid #F3F4F6', 
              borderRadius: 20, 
              marginBottom: 12 
            }}>
              <div style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 14, 
                background: '#EEF2FF', 
                color: '#5B3FC8', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 800
              }}>
                ₹
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>{item.job}</div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 3 }}>{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#22c55e' }}>+₹{item.amount}</div>
                <div style={{ fontSize: 9, color: '#aaa', fontWeight: 700, marginTop: 2 }}>PAID</div>
              </div>
            </div>
          ))
        )}

        <div 
          onClick={() => setActive("Earnings Planner")}
          className="tap-effect"
          style={{ 
            marginTop: 20, 
            padding: '24px', 
            background: '#F5F3FF', 
            border: '1.5px solid #5B3FC8', 
            borderRadius: 24, 
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(91, 63, 200, 0.1)'
          }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>🎯</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#5B3FC8' }}>Smart Earnings Planner</div>
          <div style={{ fontSize: 10, color: '#7C3AED', marginTop: 4, fontWeight: 700 }}>Set goals & let Genie AI plan your gigs →</div>
        </div>

        <div style={{ height: 100 }} />
      </div>

      <NavBar active="Profile" setActive={setActive} />
    </div>
  );
};

export default EarningsScreen;
