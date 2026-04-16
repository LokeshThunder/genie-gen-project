import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { JobService } from '../services/jobService';
import { FirestoreService } from '../services/firestoreService';
import { auth } from '../services/firebaseConfig';

const MyJobsScreen = ({ setActive }) => {
  const [activeTab, setLocalTab] = useState('Active');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;
    
    const unsubscribe = FirestoreService.streamUserApplications(
      userId,
      (data) => {
        setApplications(data);
        setLoading(false);
      },
      (err) => {
        console.error("MyJobsScreen Stream Error:", err);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [userId]);

  const jobs = applications.filter(app => {
    if (activeTab === 'Active') return app.status === 'Active';
    if (activeTab === 'Approved') return app.status === 'Approved';
    if (activeTab === 'Applied') return app.status === 'Pending';
    return false;
  });

  const renderJobCard = (job) => (
    <div key={job.id} style={{ 
      background: '#fff', 
      borderRadius: 24, 
      padding: '24px', 
      marginBottom: 16,
      boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
      border: '1.5px solid #F1F5F9'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 2 }}>{job.title || job.jobTitle || 'Warehouse Associate'}</div>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>{job.company || 'Genie Logistics'}</div>
        </div>
        <div style={{ 
          padding: '6px 14px', 
          borderRadius: 20, 
          fontSize: 10, 
          fontWeight: 900, 
          background: job.status === 'Active' ? '#F0FDF4' : '#EEF2FF',
          color: job.status === 'Active' ? '#22c55e' : '#5B3FC8',
          border: `1.5px solid ${job.status === 'Active' ? '#BBF7D0' : '#E0E7FF'}`,
          letterSpacing: 0.5
        }}>
          {job.status.toUpperCase()}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>📅</span>
          <span style={{ fontSize: 13, color: '#475569', fontWeight: 700 }}>{job.date || 'Today'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>💰</span>
          <span style={{ fontSize: 13, color: '#475569', fontWeight: 700 }}>₹{job.wage || 700}/day</span>
        </div>
      </div>

      {job.status === 'Active' && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 900, color: '#0F172A', marginBottom: 8 }}>
            <span>Progress</span>
            <span>{job.progress || 0}%</span>
          </div>
          <div style={{ height: 8, background: '#F1F5F9', borderRadius: 10, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
            <div style={{ width: `${job.progress || 0}%`, height: '100%', background: '#5B3FC8', borderRadius: 10, transition: '0.5s ease-out' }} />
          </div>
          <div 
            onClick={() => setActive('Tasks', { appId: job.id })}
            className="tap-effect"
            style={{ 
              marginTop: 24, 
              background: '#1E1B4B', 
              color: '#fff', 
              textAlign: 'center', 
              padding: '16px', 
              borderRadius: 16, 
              fontSize: 13, 
              fontWeight: 900,
              cursor: 'pointer',
              letterSpacing: 1,
              boxShadow: '0 8px 20px rgba(30,27,75,0.15)'
            }}
          >
            VIEW TASKS
          </div>
        </div>
      )}

      {(job.status === 'Approved' || job.status === 'Pending' || job.status === 'Applied') && (
        <div 
          onClick={() => job.status === 'Approved' ? setActive('Attendance', { appId: job.id, jobId: job.jobId }) : null}
          className="tap-effect"
          style={{ 
            marginTop: 8, 
            background: job.status === 'Approved' ? '#22c55e' : '#F1F5F9', 
            color: job.status === 'Approved' ? '#fff' : '#64748B', 
            textAlign: 'center', 
            padding: '16px', 
            borderRadius: 16, 
            fontSize: 12, 
            fontWeight: 800,
            cursor: job.status === 'Approved' ? 'pointer' : 'default',
            boxShadow: job.status === 'Approved' ? '0 4px 15px rgba(34,197,94,0.2)' : 'none'
          }}
        >
          {job.status === 'Approved' ? 'GO TO WORK (CHECK-IN) ✈️' : 'PENDING REVIEW...'}
        </div>
      )}
    </div>
  );

  return (
    <div className="fade-in" style={{ height: '100%', background: '#F5F7FF', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Container */}
      <div style={{ padding: '24px 20px 0', flexShrink: 0, background: '#F5F7FF' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', letterSpacing: -0.5, margin: 0 }}>My Gigs</h2>
        <p style={{ fontSize: 14, color: '#64748B', marginTop: 6, fontWeight: 600 }}>Manage your active and upcoming work.</p>
        
        {/* Premium Tab Switcher */}
        <div style={{ 
          display: 'flex', 
          gap: 6, 
          marginTop: 24, 
          background: 'rgba(241, 245, 249, 0.8)', 
          borderRadius: 18, 
          padding: '6px',
          border: '1.5px solid #E2E8F0'
        }}>
          {['Applied', 'Approved', 'Active'].map(tab => (
            <div 
              key={tab}
              onClick={() => setLocalTab(tab)}
              className="tap-effect"
              style={{ 
                flex: 1, 
                padding: '12px 0', 
                textAlign: 'center', 
                fontSize: 13, 
                fontWeight: 900, 
                borderRadius: 14,
                cursor: 'pointer',
                background: activeTab === tab ? '#fff' : 'transparent',
                color: activeTab === tab ? '#5B3FC8' : '#64748B',
                boxShadow: activeTab === tab ? '0 8px 16px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      <div className="full-height-scroll" style={{ padding: '24px 20px 100px' }}>
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 160, borderRadius: 24, marginBottom: 16 }} />
          ))
        ) : (
          jobs.length > 0 ? jobs.map(renderJobCard) : (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94A3B8' }}>
              <div style={{ fontSize: 60, marginBottom: 20, opacity: 0.5 }}>📭</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A' }}>No {activeTab} gigs yet</div>
              <p style={{ fontSize: 13, color: '#64748B', marginTop: 8, fontWeight: 500 }}>Find a gig to start earning matching your skills.</p>
              <div 
                onClick={() => setActive('Find Job')}
                className="tap-effect"
                style={{ 
                  color: '#fff', 
                  background: '#5B3FC8', 
                  fontSize: 13, 
                  fontWeight: 800, 
                  marginTop: 24, 
                  display: 'inline-block', 
                  padding: '12px 24px', 
                  borderRadius: 20, 
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(91, 63, 200, 0.2)'
                }}
              >
                Find your first gig →
              </div>
            </div>
          )
        )}
        <div style={{ height: 100 }} />
      </div>

      <NavBar active="My Jobs" setActive={setActive} />
    </div>
  );
};

export default MyJobsScreen;
