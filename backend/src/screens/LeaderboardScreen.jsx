import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FirestoreService } from '../services/firestoreService';

const LeaderboardScreen = ({ setActive, userProfile, applicationsCount = 0, t = {} }) => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      const data = await FirestoreService.getTopWorkers(10);
      const formatted = data.map((w, i) => ({
        name: w.name || 'Anonymous Worker',
        area: w.preferredAreas?.split(',')[0] || 'Hub',
        score: w.trustScore || 100,
        gigs: w.appliedJobIds?.length || 0,
        rank: i + 1,
        avatar: '👤'
      }));
      setLeaders(formatted);
      setLoading(false);
    };
    fetchLeaders();
  }, []);

  const userRank = { 
    name: userProfile?.name || 'You', 
    area: userProfile?.preferredAreas?.split(',')[0] || 'Local Hub', 
    score: userProfile?.trustScore || 100, 
    gigs: applicationsCount, 
    rank: leaders.findIndex(l => l.name === userProfile?.name) + 1 || 12, 
    avatar: '🌟' 
  };

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div 
        style={{ 
          padding: 'var(--header-pad) 20px 16px', 
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex', alignItems: 'center', gap: 12,
          zIndex: 10
        }}
      >
        <div
          onClick={() => setActive('Home')}
          className="tap-effect"
          style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text-primary)', fontWeight: 700, background: 'var(--bg-subtle)' }}>
          ←
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t.leaderboard_title || 'Leaderboard'}</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="pulse-active-green" style={{ width: 6, height: 6 }} />
            {t.hub_subtitle || 'Top performers in your hub'}
          </div>
        </div>
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '20px 16px', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0', fontSize: 14, fontWeight: 600 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🔄</div>
              Syncing Hub Rankings...
            </div>
          ) : leaders.map((leader, idx) => (
            <motion.div
              key={leader.name}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="cred-card"
              style={{ 
                padding: '12px 16px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                background: 'var(--bg-card)'
              }}
            >
              {/* Rank Badge */}
              <div style={{ 
                width: 28, 
                height: 28, 
                borderRadius: 8, 
                background: leader.rank === 1 ? '#FEF3C7' : leader.rank === 2 ? '#F1F5F9' : leader.rank === 3 ? '#FFEDD5' : '#FAFAFA', 
                border: leader.rank === 1 ? '1px solid #FCD34D' : leader.rank === 2 ? '1px solid #CBD5E1' : leader.rank === 3 ? '1px solid #FDBA74' : '1px solid var(--border)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 700, 
                fontSize: 13,
                color: leader.rank === 1 ? '#D97706' : leader.rank === 2 ? '#475569' : leader.rank === 3 ? '#C2410C' : '#9B9B9B',
              }}>
                {leader.rank}
              </div>
              
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {leader.avatar}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{leader.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{leader.area} • <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{leader.gigs} Gigs</span></div>
              </div>
              
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{leader.score}%</div>
                <div style={{ fontSize: 8, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>TRUST</div>
              </div>
            </motion.div>
          ))}

          <div style={{ margin: '12px 0', borderTop: '1px dashed var(--border)' }} />

          {/* User's Card - Premium Black Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="cred-card"
            style={{ 
              padding: '16px 20px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              background: 'var(--text-primary)',
              border: 'none',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{ 
              width: 30, 
              height: 30, 
              borderRadius: 8, 
              background: '#333333', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 700, 
              fontSize: 13,
              color: '#FFFFFF',
            }}>
              {userRank.rank}
            </div>
            
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#222222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              {userRank.avatar}
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userRank.name} (You)</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{userRank.area} • <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{userRank.gigs} Gigs</span></div>
            </div>
            
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>{userRank.score}%</div>
              <div style={{ fontSize: 8, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>TRUST</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardScreen;
