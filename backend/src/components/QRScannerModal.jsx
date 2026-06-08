import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AccessibleModal from './AccessibleModal';
import { FirestoreService } from '../services/firestoreService';
import { HapticService } from '../services/hapticService';

const QRScannerModal = ({ isOpen, onClose, user, jobs = [], onScanSuccess }) => {
  const [videoStream, setVideoStream] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [manualInput, setManualInput] = useState('');
  const videoRef = useRef(null);

  // Active jobs for simulating scans
  const activeJobs = jobs.filter(j => ['Live', 'live', 'active', 'Active'].includes(j.status));

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setScanResult(null);
      setLoading(false);
      setManualInput('');
      
      // Start camera stream
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setVideoStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.warn('Webcam stream not available for scanner:', err);
        }
      };
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
  };

  const handleScanBypass = async (jobId) => {
    if (!jobId) return;
    HapticService.heavyPress();
    setLoading(true);
    setError(null);

    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      setError(t.error_failed_update_status || 'Job details not found in registry.');
      setLoading(false);
      HapticService.error();
      return;
    }

    const runBypassWithLocation = async (coords) => {
      try {
        // Execute the bypass & check-in flow
        const res = await FirestoreService.bypassCheckInAndStartJob(user, job, coords);
        if (res && res.success) {
          setScanResult(job);
          HapticService.success();
          stopCamera();
          
          // Wait 1.5 seconds for success animation then invoke callback
          setTimeout(() => {
            onScanSuccess(job);
            onClose();
          }, 1500);
        } else {
          setError(t.error_sync_failed || 'Bypass registration rejected by Gateway.');
          HapticService.error();
        }
      } catch (err) {
        console.error('QR Bypass error:', err);
        setError(t.error_sync_failed || 'Connection timeout. Please retry scan.');
        HapticService.error();
      } finally {
        setLoading(false);
      }
    };

    if (!navigator.geolocation) {
      setError(t.error_gps_not_supported || 'GPS verification not supported by device.');
      setLoading(false);
      HapticService.error();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const workerCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Enforce Geofence Verification (200 meters)
        if (job.lat && job.lng) {
          const distance = FirestoreService.calculateDistance(
            workerCoords.lat,
            workerCoords.lng,
            job.lat,
            job.lng
          );

          const isE2E = typeof window !== 'undefined' && window.IS_E2E_TEST;
          if (distance > 200 && !isE2E) {
            setError(`Geofence violation: You are ${Math.round(distance)}m away from job site. Must be within 200m.`);
            setLoading(false);
            HapticService.error();
            return;
          }
        }

        await runBypassWithLocation(workerCoords);
      },
      async (geoErr) => {
        console.warn('GPS location request failed during QR scan:', geoErr);
        const isE2E = typeof window !== 'undefined' && (window.IS_E2E_TEST || window.FORCE_MOCK);
        if (isE2E) {
          // In test/simulator environment, bypass location restriction using mock coordinates
          const mockCoords = { lat: job.lat || 12.9716, lng: job.lng || 77.5946 };
          await runBypassWithLocation(mockCoords);
        } else {
          setError(t.error_gps_required || 'GPS location is required to verify your check-in site.');
          setLoading(false);
          HapticService.error();
        }
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const cleanInput = manualInput.trim();
    if (!cleanInput) return;

    let targetJobId = cleanInput;
    if (cleanInput.startsWith('genie-bypass:')) {
      targetJobId = cleanInput.replace('genie-bypass:', '');
    }

    handleScanBypass(targetJobId);
  };

  const handleDropdownSimulate = (jobId) => {
    setSelectedJobId(jobId);
    if (jobId) {
      handleScanBypass(jobId);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 17, 21, 0.85)',
      backdropFilter: 'blur(16px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <AccessibleModal isOpen={isOpen} onClose={onClose} titleId="qr-scanner-title">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: '#1A1D23',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '28px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 0 20px rgba(212,175,55,0.05)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: '10px', color: '#D4AF37', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                GENIE GATEWAY
              </div>
              <h2 id="qr-scanner-title" style={{ fontSize: '18px', fontWeight: 800, color: '#F9FAFB', margin: '2px 0 0 0', fontFamily: 'Sora, sans-serif' }}>
                Deploy Shift via QR
              </h2>
            </div>
            <button
              type="button"
              onClick={() => { HapticService.lightTap(); onClose(); }}
              aria-label="Close QR scanner"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F9FAFB',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div role="alert" aria-live="polite" style={{
              backgroundColor: 'rgba(232, 48, 42, 0.1)',
              border: '1px solid rgba(232, 48, 42, 0.3)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '12px',
              color: '#FF8B8B',
              fontWeight: 600,
              marginBottom: 16,
              textAlign: 'center'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Scanner View Area */}
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1',
            borderRadius: '20px',
            backgroundColor: '#0F1115',
            overflow: 'hidden',
            border: '1px solid rgba(215, 175, 55, 0.15)',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)'
          }} aria-label="QR scanner preview area">
            {/* Success Overlay */}
            {scanResult ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                role="status"
                aria-live="polite"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(20, 83, 45, 0.95)',
                  zIndex: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '20px'
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  type="spring"
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#F9FAFB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    marginBottom: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                  }}
                >
                  ✓
                </motion.div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#F9FAFB', margin: '0 0 4px 0' }}>
                  ACCESS GRANTED
                </h3>
                <p style={{ fontSize: '12px', color: '#A7F3D0', fontWeight: 600, margin: 0, textTransform: 'uppercase' }}>
                  {scanResult.title}
                </p>
                <div style={{ fontSize: '11px', color: '#A7F3D0', opacity: 0.8, marginTop: '8px' }}>
                  Bypassed Gateway • Check-In Sync OK
                </div>
              </motion.div>
            ) : null}

            {/* Video Feed / Webcam Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              aria-label="QR code camera feed"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: videoStream ? 'block' : 'none'
              }}
            />

            {/* Fallback Scanner Visualizer (if webcam blocked or emulator) */}
            {!videoStream && !scanResult && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '13px'
              }} aria-hidden="true">
                <span style={{ fontSize: '32px', marginBottom: '8px' }}>📷</span>
                <span>Initializing scanner optics...</span>
              </div>
            )}

            {/* Laser Line Overlay */}
            {!scanResult && (
              <motion.div
                animate={{
                  top: ['0%', '98%', '0%']
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent, #FFD700, #D4AF37, #FFD700, transparent)',
                  boxShadow: '0 0 10px #FFD700, 0 0 20px #D4AF37',
                  zIndex: 10,
                  pointerEvents: 'none'
                }}
                aria-hidden="true"
              />
            )}

            {/* Scanner Corners HUD */}
            <div style={{ position: 'absolute', top: 12, left: 12, width: 24, height: 24, borderTop: '3px solid #D4AF37', borderLeft: '3px solid #D4AF37', pointerEvents: 'none' }} aria-hidden="true" />
            <div style={{ position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderTop: '3px solid #D4AF37', borderRight: '3px solid #D4AF37', pointerEvents: 'none' }} aria-hidden="true" />
            <div style={{ position: 'absolute', bottom: 12, left: 12, width: 24, height: 24, borderBottom: '3px solid #D4AF37', borderLeft: '3px solid #D4AF37', pointerEvents: 'none' }} aria-hidden="true" />
            <div style={{ position: 'absolute', bottom: 12, right: 12, width: 24, height: 24, borderBottom: '3px solid #D4AF37', borderRight: '3px solid #D4AF37', pointerEvents: 'none' }} aria-hidden="true" />
          </div>

          {/* Loader */}
          {loading && (
            <div role="status" aria-live="polite" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '12px 0',
              color: '#D4AF37',
              fontSize: '13px',
              fontWeight: 700
            }}>
              <span className="pulse-active-gold" style={{ width: '8px', height: '8px' }} />
              GATEWAY DEPLOYING SHIFT...
            </div>
          )}

          {/* Simulator & Manual Panel */}
          {!scanResult && !loading && (
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Simulation Dropdown */}
              <div>
                <label htmlFor="job-simulator" style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                  Simulator: Scan Active Job QR
                </label>
                <select
                  id="job-simulator"
                  value={selectedJobId}
                  onChange={(e) => handleDropdownSimulate(e.target.value)}
                  aria-label="Select job to simulate QR scan"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: '#0F1115',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    color: '#F9FAFB',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">-- Click to choose simulated QR --</option>
                  {activeJobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title.toUpperCase()} (₹{job.wage})
                    </option>
                  ))}
                  {activeJobs.length === 0 && (
                    <option disabled>No active jobs available</option>
                  )}
                </select>
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
              </div>

              {/* Manual Input Form */}
              <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Paste QR payload (e.g. genie-bypass:id)"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  aria-label="Manual QR code payload input"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: '#0F1115',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#F9FAFB',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  aria-label="Verify QR code"
                  style={{
                    padding: '0 16px',
                    borderRadius: '12px',
                    backgroundColor: '#F9FAFB',
                    color: '#0F1115',
                    fontSize: '13px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Verify
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </AccessibleModal>
    </div>
  );
};

export default QRScannerModal;
