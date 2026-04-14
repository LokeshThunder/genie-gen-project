import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { JobService } from '../services/jobService';

const AttendanceScreen = ({ setActive }) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [locationStatus, setLocationStatus] = useState('Verifying GPS...');

  useEffect(() => {
    let interval = null;
    if (isCheckedIn) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn]);

  useEffect(() => {
    const timer = setTimeout(() => setLocationStatus('📍 Verified at Site (Within Radius)'), 1500);
    return () => clearTimeout(timer);
  }, []);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAttendance = async () => {
    setLoading(true);
    // Simulate camera capture & API call
    setTimeout(async () => {
      if (!isCheckedIn) {
        await JobService.checkIn('1', 'selfie_data', { lat: 12.9647, lng: 80.1911 });
        setIsCheckedIn(true);
      } else {
        await JobService.checkOut('1', 'selfie_data', { lat: 12.9647, lng: 80.1911 });
        setIsCheckedIn(false);
        setSeconds(0);
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="fade-in" style={{ height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 10px', flexShrink: 0 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#111' }}>Daily Attendance</div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Job: Active Assignment</div>
      </div>

      <div className="full-height-scroll" style={{ padding: '10px 20px' }}>
        {/* Camera Preview Simulation */}
        <div style={{ 
          width: '100%', 
          aspectRatio: '3/4', 
          background: '#000', 
          borderRadius: 24, 
          position: 'relative', 
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          {/* Simulated scanning animation */}
          {!isCheckedIn && (
            <div style={{ 
              position: 'absolute', 
              top: '20%', 
              left: '15%', 
              right: '15%', 
              height: 2, 
              background: 'rgba(34, 197, 94, 0.6)', 
              boxShadow: '0 0 15px #22c55e',
              animation: 'scan 3s infinite ease-in-out'
            }} />
          )}
          
          <div style={{ 
            position: 'absolute', 
            bottom: 20, 
            left: 0, 
            right: 0, 
            textAlign: 'center', 
            color: '#fff', 
            fontSize: 12, 
            fontWeight: 600,
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            {isCheckedIn ? '✅ FACE VERIFIED' : '📸 ALIGN FACE FOR CHECK-IN'}
          </div>

          {/* Placeholder for camera stream */}
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 80, opacity: 0.2 }}>👤</span>
          </div>
        </div>

        {/* GPS Status */}
        <div style={{ 
          marginTop: 20, 
          background: '#F0FDF4', 
          border: '1px solid #BBF7D0', 
          borderRadius: 16, 
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>{locationStatus}</div>
        </div>

        {/* Timer Card */}
        {isCheckedIn && (
          <div className="fade-in" style={{ 
            marginTop: 15, 
            background: 'linear-gradient(135deg, #1A1A3E, #2D2D6E)', 
            borderRadius: 20, 
            padding: '24px',
            textAlign: 'center',
            color: '#fff'
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, letterSpacing: 1 }}>SHIFT DURATION</div>
            <div style={{ fontSize: 42, fontWeight: 800, marginTop: 5, fontFamily: 'monospace' }}>{formatTime(seconds)}</div>
            <div style={{ fontSize: 12, marginTop: 8, color: '#6EE7B7', fontWeight: 600 }}>Earned so far: ₹{(seconds * 0.024).toFixed(2)}</div>
          </div>
        )}

        {/* Action Button */}
        <div 
          onClick={loading ? null : handleAttendance}
          className="tap-effect"
          style={{ 
            marginTop: 25, 
            background: isCheckedIn ? '#EF4444' : '#5B3FC8', 
            borderRadius: 18, 
            padding: '18px 0', 
            textAlign: 'center', 
            color: '#fff', 
            fontWeight: 800, 
            fontSize: 16,
            boxShadow: `0 10px 20px ${isCheckedIn ? 'rgba(239, 68, 68, 0.2)' : 'rgba(91, 63, 200, 0.2)'}`,
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Processing...' : (isCheckedIn ? '🛑 CHECK OUT' : '🔋 CHECK IN NOW')}
        </div>

        <div style={{ height: 100 }} />
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 20%; }
          50% { top: 70%; }
          100% { top: 20%; }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      
      <NavBar active="Attendance" setActive={setActive} />
    </div>
  );
};

export default AttendanceScreen;
