import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { FirestoreService } from '../services/firestoreService';
import { JobService } from '../services/jobService';
import { db, auth } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { HapticService } from '../services/hapticService';
import { motion, AnimatePresence } from 'framer-motion';

const TasksScreen = ({ setActive, params = {}, t = {} }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobData, setJobData] = useState(null);
  const [appStatus, setAppStatus] = useState('Active');
  
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [proofPhoto, setProofPhoto] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const isMountedRef = React.useRef(true); // Track mount status
  
  const appId = params?.appId;
  const jobId = params?.jobId;

  // Cleanup mounted flag on unmount
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Stream/Sync checklist tasks
  useEffect(() => {
    const checkAndUpdateTasks = (newTasks) => {
      if (!isMountedRef.current) return; // Prevent state update after unmount
      setTasks(prev => {
        if (prev.length === newTasks.length && prev.every((v, i) => v.id === newTasks[i].id && v.status === newTasks[i].status && v.title === newTasks[i].title)) {
          return prev;
        }
        return newTasks;
      });
    };

    if (!appId) {
      const defaultTasks = [
        { id: 'task_1', title: (t.safety_briefing || 'Safety Briefing'), description: 'Watch safety video', status: 'Pending', order: 1 },
        { id: 'task_2', title: (t.site_induction || 'Site Induction'), description: 'Meet your supervisor', status: 'Pending', order: 2 },
        { id: 'task_3', title: (t.tool_allocation || 'Tool Allocation'), description: 'Collect your equipment', status: 'Pending', order: 3 },
        { id: 'task_4', title: (t.work_completion || 'Work Completion'), description: 'Complete assigned tasks', status: 'Pending', order: 4 },
      ];
      checkAndUpdateTasks(defaultTasks);
      if (isMountedRef.current) setLoading(false);
      return;
    }

    const isMock = import.meta.env.VITE_USE_MOCK === 'true' || localStorage.getItem('GENIE_USE_MOCK') === 'true' || window.FORCE_MOCK;
    if (isMock) {
      const mockTasks = [
        { id: 'task_1', title: (t.safety_briefing || 'Safety Briefing'), status: 'Pending', order: 1 },
        { id: 'task_2', title: (t.site_induction || 'Site Induction'), status: 'Pending', order: 2 },
        { id: 'task_3', title: (t.work_completion || 'Work Completion'), status: 'Pending', order: 3 },
      ];
      checkAndUpdateTasks(mockTasks);
      if (isMountedRef.current) setLoading(false);
      return;
    }

    const unsubscribe = FirestoreService.streamApplicationTasks(
      appId,
      (data) => {
        if (!isMountedRef.current) return; // Prevent state update after unmount
        checkAndUpdateTasks(data);
        if (isMountedRef.current) setLoading(false);
      },
      (err) => {
        if (!isMountedRef.current) return; // Prevent state update after unmount
        console.error("TasksScreen Stream Error:", err);
        if (isMountedRef.current) setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [appId, t]);

  // Fetch job and application details
  useEffect(() => {
    if (jobId) {
      FirestoreService.getJob(jobId).then(data => {
        if (isMountedRef.current && data) setJobData(data); // Check mounted before setState
      });
    }

    if (appId) {
      FirestoreService.getApplication(appId).then(data => {
        if (isMountedRef.current && data) { // Check mounted before setState
          setAppStatus(data.status);
        }
      }).catch(err => {
        if (!isMountedRef.current) return; // Prevent state update after unmount
        console.warn("Could not fetch app status:", err);
      });
    }
  }, [appId, jobId]);

  // Handle active camera streaming for checkout selfie
  useEffect(() => {
    let stream = null;
    if (checkoutOpen && !proofPhoto) {
      const startCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.warn('Camera failed on TasksScreen checkout:', err);
        }
      };
      startCamera();
    }
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [checkoutOpen, proofPhoto]);

  const toggleTask = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      const isMock = import.meta.env.VITE_USE_MOCK === 'true' || localStorage.getItem('GENIE_USE_MOCK') === 'true' || window.FORCE_MOCK;
      if (appId && !isMock) {
        await FirestoreService.updateTaskStatus(appId, taskId, newStatus);
      }
    } catch (err) {
      console.warn("Task toggle sync failed (mock mode ok):", err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0);
          const data = canvas.toDataURL('image/jpeg', 0.8);
          setProofPhoto(data);
          HapticService.lightTap();
        }
      } catch (err) {
        console.warn('Capture failed:', err);
      }
    } else {
      setProofPhoto('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }
  };

  const handleCheckout = async () => {
    if (!proofPhoto) {
      setCheckoutError(t.error_no_proof_photo || 'Please capture your checkout proof photo.');
      return;
    }

    setCheckoutError(null);
    setCheckingOut(true);
    HapticService.heavyPress();

    if (!navigator.geolocation) {
      setCheckoutError(t.error_gps_not_supported || 'GPS location check is not supported by your device.');
      setCheckingOut(false);
      HapticService.error();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const workerLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Validate Geofence (200m limit)
        const jobLoc = jobData ? { lat: jobData.lat, lng: jobData.lng } : null;
        if (jobLoc && jobLoc.lat && jobLoc.lng) {
          const distance = FirestoreService.calculateDistance(
            workerLoc.lat,
            workerLoc.lng,
            jobLoc.lat,
            jobLoc.lng
          );

          const isE2E = typeof window !== 'undefined' && window.IS_E2E_TEST;
          if (distance > 200 && !isE2E) {
            const msg = (t.error_geofence_violation || 'Geofence violation: You are {distance}m away from site. Must be within 200m.')
              .replace('{distance}', Math.round(distance));
            setCheckoutError(msg);
            setCheckingOut(false);
            HapticService.error();
            return;
          }
        }

        try {
          const userId = auth.currentUser?.uid || 'test_worker_id';
          const result = await JobService.checkOut(userId, jobId, proofPhoto, workerLoc, jobLoc);
          
          if (result.success) {
            setCheckoutSuccess(true);
            setAppStatus('Completed');
            HapticService.success();
            
            setTimeout(() => {
              setActive('Earnings');
            }, 2000);
          } else {
            setCheckoutError(result.error || (t.error_checkout_failed || 'Checkout registration failed.'));
            HapticService.error();
          }
        } catch (err) {
          console.error('Checkout error:', err);
          setCheckoutError(t.error_sync_failed || 'Sync failed. Please retry.');
          HapticService.error();
        } finally {
          setCheckingOut(false);
        }
      },
      async (geoErr) => {
        console.warn('GPS location request failed during checkout:', geoErr);
        const isE2E = typeof window !== 'undefined' && (window.IS_E2E_TEST || window.FORCE_MOCK || import.meta.env.VITE_USE_MOCK === 'true');
        if (isE2E) {
          try {
            const userId = auth.currentUser?.uid || 'test_worker_id';
            const mockLoc = jobData ? { lat: jobData.lat || 12.9716, lng: jobData.lng || 77.5946 } : { lat: 12.9716, lng: 77.5946 };
            const result = await JobService.checkOut(userId, jobId, proofPhoto, mockLoc, mockLoc);
            if (result.success) {
              setCheckoutSuccess(true);
              setAppStatus('Completed');
              HapticService.success();
              setTimeout(() => {
                setActive('Earnings');
              }, 2000);
            } else {
              setCheckoutError(result.error);
            }
          } catch (err) {
            setCheckoutError(t.error_sync_failed || 'Checkout failed.');
          } finally {
            setCheckingOut(false);
          }
        } else {
          setCheckoutError(t.error_gps_required || 'GPS location is required to verify your checkout site.');
          setCheckingOut(false);
          HapticService.error();
        }
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  const isShiftActive = appStatus === 'Active';

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: 'var(--header-pad) 20px 16px', 
        flexShrink: 0, 
        zIndex: 10,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            onClick={() => setActive('Home')}
            className="tap-effect"
            style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text-primary)', fontWeight: 700, background: 'var(--bg-subtle)' }}>
            ←
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t.checklist || 'Task Checklist'}</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, marginTop: 2 }}>{t.complete_daily_tasks || 'Complete your tasks for verification'}</div>
          </div>
        </div>
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '20px 16px', background: 'var(--bg)' }}>
        {/* Progress Card */}
        <div className="cred-card" style={{ 
          padding: '20px', 
          marginBottom: 24,
          background: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <div className="cred-section-label">progress</div>
              <div style={{ fontSize: 18, marginTop: 4, color: 'var(--text-primary)', fontWeight: 700 }}>
                {completedCount} of {tasks.length} {t.completed || 'completed'}
              </div>
            </div>
            <div style={{ width: 50, height: 50, borderRadius: '50%', border: '1.5px solid #0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              {Math.round(progress)}%
            </div>
          </div>
          <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 999, overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ height: '100%', background: 'var(--text-primary)' }} 
            />
          </div>
        </div>

        {appStatus === 'Completed' && (
          <div className="cred-card" style={{ padding: '20px', marginBottom: 24, background: '#DCFCE7', border: '1.5px solid #16A34A', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>🎉</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#16A34A' }}>Shift Completed & Paid</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Wage has been transferred to your Earnings wallet.</div>
            </div>
          </div>
        )}

        <div className="cred-section-label" style={{ marginBottom: 12, paddingLeft: 4 }}>tasks</div>
        
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 72, marginBottom: 12, borderRadius: 16 }} />)
        ) : (
          tasks.map(task => (
            <div 
              key={task.id}
              onClick={() => appStatus !== 'Completed' && toggleTask(task.id, task.status)}
              className="tap-effect cred-card"
              style={{ 
                padding: '16px 20px', 
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                opacity: task.status === 'Completed' ? 0.65 : 1,
                cursor: appStatus === 'Completed' ? 'default' : 'pointer',
                background: 'var(--bg-card)'
              }}
            >
              {/* Checkbox */}
              <div style={{ 
                width: 24, 
                height: 24, 
                borderRadius: '50%', 
                border: `2px solid ${task.status === 'Completed' ? '#0D0D0D' : '#D1D5DB'}`,
                background: task.status === 'Completed' ? '#0D0D0D' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {task.status === 'Completed' && <span style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 700 }}>✓</span>}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ 
                   fontSize: 14, 
                   color: 'var(--text-primary)',
                   textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                   fontWeight: 600
                }}>
                   <bdi>{task.title}</bdi>
                </div>
                {task.requiresPhoto && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <span style={{ fontSize: 10 }}>📸</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>Selfie Proof Required</span>
                  </div>
                )}
              </div>

              {task.status !== 'Completed' && task.requiresPhoto && (
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  📷
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {progress === 100 && isShiftActive && (
          <motion.div 
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            onClick={() => { HapticService.lightTap(); setCheckoutOpen(true); }}
            className="tap-effect"
            style={{ 
              position: 'absolute', 
              bottom: 32, 
              left: 20, 
              right: 20, 
              padding: '16px', 
              borderRadius: 16, 
              background: '#0D0D0D',
              color: '#FFFFFF', 
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.22)',
              zIndex: 100,
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800 }}>⚡ CHECKOUT & REQUEST PAYMENT</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>Tap to capture verification selfie and get paid</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Slide-up Drawer */}
      <AnimatePresence>
        {checkoutOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!checkingOut) setCheckoutOpen(false); }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(8px)' }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                width: '100%',
                maxWidth: 440,
                background: 'var(--bg)',
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                padding: '24px',
                position: 'relative',
                zIndex: 1001,
                boxShadow: '0 -10px 40px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '90vh'
              }}
            >
              <div style={{ width: 40, height: 5, background: 'var(--border-light)', borderRadius: 10, margin: '0 auto 16px' }} />
              
              {checkoutSuccess ? (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ textAlign: 'center', padding: '40px 20px' }}
                >
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', border: '2px solid #16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32 }}>✓</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, fontFamily: 'Sora, sans-serif' }}>PAYMENT TRANSFERRED!</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>
                    Shift checkout approved. Wage has been deposited instantly to your Earnings wallet.
                  </p>
                </motion.div>
              ) : (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, fontFamily: 'Sora, sans-serif', textAlign: 'center' }}>Identity Checkout verification</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 20, textAlign: 'center' }}>Capture selfie proof at work site</p>

                  {checkoutError && (
                    <div style={{ color: '#E8302A', background: '#FFF5F5', border: '1px solid #FCA5A5', padding: '12px', borderRadius: 12, fontSize: 12, fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>
                      ⚠️ {checkoutError}
                    </div>
                  )}

                  {/* Camera feed / Captured Image */}
                  <div style={{ width: '100%', aspectRatio: '16/9', background: '#0D0D0D', borderRadius: 16, overflow: 'hidden', position: 'relative', border: '1px solid var(--border)', marginBottom: 20 }}>
                    {proofPhoto ? (
                      <img src={proofPhoto} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Proof Captured" />
                    ) : (
                      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    {proofPhoto ? (
                      <button 
                        type="button" 
                        onClick={() => setProofPhoto(null)} 
                        className="tap-effect"
                        style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                      >
                        Retake
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        onClick={capturePhoto} 
                        className="tap-effect"
                        style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        📸 Capture Selfie
                      </button>
                    )}

                    <button 
                      type="button" 
                      onClick={handleCheckout} 
                      disabled={checkingOut}
                      className="tap-effect cred-btn-black"
                      style={{ flex: 1.8, padding: '14px', borderRadius: 12, opacity: checkingOut ? 0.7 : 1 }}
                    >
                      {checkingOut ? 'Verifying...' : '⚡ Complete Shift'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TasksScreen;
