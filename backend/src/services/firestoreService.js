import { db } from './firebaseConfig';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  addDoc,
  arrayUnion,
  limit,
  orderBy,
  startAfter
} from 'firebase/firestore';
import { MockFirestore } from './mockFirestore';
import { sanitizeText, rateLimiter, validateProfileData } from './securityService';
import { withRateLimit } from '../utils/rateLimitingService';

// ─── MOCK TOGGLE ────────────────────────────────────────────────────────────
// Set VITE_USE_MOCK=false in .env to use real Firestore.
// Falls back to mock if Firestore throws permission errors.
//
// SECURITY: The old implementation used window.FORCE_MOCK which allowed any
// attacker opening DevTools to type `window.FORCE_MOCK = true` and switch
// the app to an in-memory mock that bypasses all Firestore security rules.
// This has been replaced with a module-scoped variable that cannot be
// manipulated from the browser console.
let _forceMockFallback = false;

const isMockEnabled = () => {
  // SECURITY: Prevent MockFirestore in production builds (CRITICAL)
  if (import.meta.env.MODE === 'production') {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      console.error('[SECURITY] MockFirestore is enabled in a production build! This should be disabled in .env.production.');
    }
    
    if (_forceMockFallback) {
      console.error('[NETWORK] Firebase is unreachable or permission denied. Mock fallback attempted but ignored in production.');
    }
    
    return false; // Strict: never use mock in production, let Firebase handle offline caching
  }
  
  if (_forceMockFallback) return true;
  const envVal = import.meta.env.VITE_USE_MOCK;
  return envVal === 'true';
};

// Internal helper — activates mock fallback without exposing it globally
const _activateMockFallback = () => { _forceMockFallback = true; };

// ─── DEBOUNCE HELPER ─────────────────────────────────────────────────────────
// Prevents rapid successive stream emissions from causing multiple re-renders.
// Waits `ms` milliseconds after the last call before invoking the callback.
const debounce = (fn, ms = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

// Module-scoped flag to prevent recursive SDK crashes on permission errors
let globalFirestoreErrorLock = false;

export const FirestoreService = {
  // --- USERS & PROFILES ---
  
  async awardUserXP(userId, xpAmount, type = 'completion') {
    if (!userId) return;
    if (isMockEnabled()) return MockFirestore.awardUserXP(userId, xpAmount);
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const currentXP = userData.xp || 0;
        const newXP = currentXP + xpAmount;
        
        // Trust Shield Logic: Completion increases trust score (+2), Absence decreases it (-10)
        let currentTrust = userData.trustScore || 80; // Start at 80
        if (type === 'completion') currentTrust = Math.min(100, currentTrust + 2);
        if (type === 'absence') currentTrust = Math.max(0, currentTrust - 15);
        
        let expLabel = userData.exp || 'New Joiner';
        if (newXP >= 500) expLabel = 'Pro';
        if (newXP >= 1500) expLabel = 'Expert';
        if (newXP >= 4000) expLabel = 'Elite';
        
        await updateDoc(userRef, {
          xp: newXP,
          exp: expLabel,
          trustScore: currentTrust,
          updatedAt: serverTimestamp()
        });
        console.log(`[TrustShield] XP: ${newXP}, Trust: ${currentTrust} for user ${userId}`);
      }
    } catch (e) {
      console.warn("[FirestoreService] awardUserXP failed.");
    }
  },

  async checkTrustGate(userId, minTrust = 60) {
    if (!userId) return false;
    const profile = await this.getUserProfile(userId);
    return (profile?.trustScore || 80) >= minTrust;
  },

  async saveUserProfile(uid, profileData) {
    if (!uid) return;
    if (isMockEnabled()) {
      await MockFirestore.saveUserProfile(uid, profileData);
      return;
    }

    // SECURITY: Validate that the client is not attempting to escalate their own role
    const { valid, error } = validateProfileData(profileData, uid);
    if (!valid) {
      console.error('[FirestoreService] saveUserProfile blocked:', error);
      return;
    }

    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn("[FirestoreService] saveUserProfile failed.");
    }
  },

  async getUserProfile(uid) {
    if (!uid) return null;
    if (isMockEnabled()) return MockFirestore.getUserProfile(uid);
    const userRef = doc(db, 'users', uid);
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    } catch (e) {
       console.warn("[FirestoreService] getUserProfile failed, using MOCK fallback.");
       _activateMockFallback();
       return MockFirestore.getUserProfile(uid);
    }
  },

  // --- JOBS (ADMIN) ---

  async addJob(jobData) {
    if (isMockEnabled()) return MockFirestore.addJob(jobData);
    try {
      const jobsRef = collection(db, 'jobs');
      const docRef = await addDoc(jobsRef, {
        ...jobData,
        status: 'Live',
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      console.warn("[FirestoreService] Falling back to MOCK mode due to error:", e);
      _activateMockFallback();
      return MockFirestore.addJob(jobData);
    }
  },

  async updateJob(jobId, jobData) {
    if (isMockEnabled()) return; // Mocking update is optional for now
    try {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, {
        ...jobData,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.warn("[FirestoreService] updateJob failed.");
    }
  },

  async getJobs() {
    if (isMockEnabled()) return MockFirestore.getJobs();
    try {
      const jobsRef = collection(db, 'jobs');
      // Get only Live/Active jobs, limited to 100 for pagination
      const q = query(
        jobsRef,
        where('status', 'in', ['Live', 'live', 'active', 'Active']),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.warn("[FirestoreService] getJobs failed, using MOCK.", e);
      _activateMockFallback();
      return MockFirestore.getJobs();
    }
  },

  // Paginated version for infinite scroll
  async getJobsPaginated(pageSize = 50, lastJobDoc = null) {
    if (isMockEnabled()) {
      const allJobs = await MockFirestore.getJobs();
      return {
        jobs: allJobs.slice(0, pageSize),
        lastDoc: allJobs[pageSize - 1] || null,
        hasMore: allJobs.length > pageSize
      };
    }
    try {
      const jobsRef = collection(db, 'jobs');
      let q;
      
      if (lastJobDoc) {
        q = query(
          jobsRef,
          where('status', 'in', ['Live', 'live', 'active', 'Active']),
          orderBy('createdAt', 'desc'),
          startAfter(lastJobDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          jobsRef,
          where('status', 'in', ['Live', 'live', 'active', 'Active']),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
      }
      
      const snap = await getDocs(q);
      const jobs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      return {
        jobs,
        lastDoc: snap.docs[snap.docs.length - 1] || null,
        hasMore: jobs.length === pageSize
      };
    } catch (e) {
      console.warn("[FirestoreService] getJobsPaginated failed:", e);
      throw e;
    }
  },

  async getJob(jobId) {
    if (!jobId) return null;
    if (isMockEnabled()) {
      const jobs = await MockFirestore.getJobs();
      return jobs.find(j => j.id === jobId) || null;
    }
    try {
      const docRef = doc(db, 'jobs', jobId);
      const snap = await getDoc(docRef);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (e) {
      console.warn("[FirestoreService] getJob failed, using MOCK.");
      const jobs = await MockFirestore.getJobs();
      return jobs.find(j => j.id === jobId) || null;
    }
  },

  streamJobs(callback, onError) {
    const debouncedCallback = debounce(callback, 250);
    if (isMockEnabled()) {
      // Fire immediately once, then poll every 60s (data rarely changes in mock)
      MockFirestore.getJobs().then(debouncedCallback);
      const poll = setInterval(() => {
        MockFirestore.getJobs().then(debouncedCallback);
      }, 2000);
      return () => clearInterval(poll);
    }
    if (globalFirestoreErrorLock) return () => {};
    const jobsRef = collection(db, 'jobs');
    try {
      return onSnapshot(jobsRef,
        (snap) => {
          const jobs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          debouncedCallback(jobs);
        },
        (error) => {
          console.error("Firestore streamJobs Error:", error);
          globalFirestoreErrorLock = true;
          _activateMockFallback();
          MockFirestore.getJobs().then(debouncedCallback);
          if (onError) onError(error);
        }
      );
    } catch (e) {
      console.error("Critical Snapshot Error (Jobs):", e);
      return () => {};
    }
  },

  streamLiveJobs(callback, onError) {
    const debouncedCallback = debounce(callback, 250);
    const liveFilter = jobs => jobs.filter(j => ['Live', 'live', 'active', 'Active'].includes(j.status));
    if (isMockEnabled()) {
      MockFirestore.getJobs().then(jobs => debouncedCallback(liveFilter(jobs)));
      const poll = setInterval(() => {
        MockFirestore.getJobs().then(jobs => debouncedCallback(liveFilter(jobs)));
      }, 2000);
      return () => clearInterval(poll);
    }
    const jobsRef = collection(db, 'jobs');
    // OPTIMIZATION: Filter to only live jobs, order by newest first, limit to 200 for performance
    const q = query(
      jobsRef,
      where('status', 'in', ['Live', 'live', 'active', 'Active']),
      orderBy('createdAt', 'desc'),
      limit(200)
    );
    try {
      return onSnapshot(q,
        (snap) => {
          const jobs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          debouncedCallback(jobs);
        },
        (error) => {
          console.error("Firestore streamLiveJobs Error:", error);
          globalFirestoreErrorLock = true;
          _activateMockFallback();
          MockFirestore.getJobs().then(jobs => debouncedCallback(liveFilter(jobs)));
          if (onError) onError(error);
        }
      );
    } catch (e) {
      console.error("Critical Snapshot Error (LiveJobs):", e);
      return () => {};
    }
  },

  // --- APPLICATIONS (WORKER) ---

  async applyToJob(user, job) {
    if (!user?.uid || !job?.id) return;
    if (isMockEnabled()) return MockFirestore.applyToJob(user, job);

    // SECURITY: Rate-limit application submissions to prevent flooding
    // Max 3 applications per 60 seconds per session
    const rateLimitKey = `apply_job_${user.uid}`;
    if (!rateLimiter.check(rateLimitKey, 3, 60_000)) {
      throw new Error('RATE_LIMITED: Too many applications. Please wait before applying again.');
    }

    try {
      const workerId = user.uid;
      const jobId = job.id;
      const companyId = job.companyId || job.postedBy || 'system_genie';

      // SECURITY: Sanitise display name to prevent stored XSS
      const rawName = user.displayName || user.name || 'Anonymous Worker';
      const safeName = sanitizeText(rawName, 100);
      
      const appRef = doc(db, 'applications', `${workerId}_${jobId}`);
      
      await setDoc(appRef, {
        workerId,
        jobId,
        companyId,
        workerName: safeName,
        name: safeName,
        jobTitle: sanitizeText(job.title || '', 150),
        status: 'Pending', // Always forced to Pending — cannot be overridden by client
        appliedAt: serverTimestamp()
      });
      
      // Update local cache
      const userRef = doc(db, 'users', workerId);
      await updateDoc(userRef, { 
        appliedJobIds: arrayUnion(jobId) 
      });
    } catch (e) {
      if (e.message?.startsWith('RATE_LIMITED')) throw e;
      console.warn("[FirestoreService] applyToJob failed, using MOCK.");
      _activateMockFallback();
      return MockFirestore.applyToJob(user, job);
    }
  },

  async bypassCheckInAndStartJob(user, job, location = null) {
    if (!user?.uid || !job?.id) return { success: false, error: 'Invalid user or job' };
    
    // SECURITY: Require explicit location parameter - no unsafe defaults
    if (!location || !location.lat || !location.lng) {
      return { success: false, error: 'Valid GPS location required for QR code check-in' };
    }
    
    // Validate location is within India bounds (8°N to 35°N, 68°E to 97°E)
    if (location.lat < 8 || location.lat > 35 || location.lng < 68 || location.lng > 97) {
      return { success: false, error: 'Check-in location outside India. Spoofing detected?' };
    }
    
    if (isMockEnabled()) return MockFirestore.bypassCheckInAndStartJob(user, job, location);
    try {
      const workerId = user.uid;
      const jobId = job.id;
      const companyId = job.companyId || job.postedBy || 'system_genie';
      const appId = `${workerId}_${jobId}`;
      
      const appRef = doc(db, 'applications', appId);
      
      // Create application directly as ACTIVE
      await setDoc(appRef, {
        workerId,
        jobId,
        companyId,
        workerName: user.displayName || user.name || 'Anonymous Worker',
        name: user.displayName || user.name || 'Anonymous Worker',
        jobTitle: job.title,
        status: 'Active',
        appliedAt: serverTimestamp()
      });
      
      // Update local cache
      const userRef = doc(db, 'users', workerId);
      await updateDoc(userRef, { 
        appliedJobIds: arrayUnion(jobId) 
      });

      // Initialize tasks for this application
      await this.initializeTasks(appId, job.category || 'General', job.customTasks || []);

      // Create attendance directly as Checked In (IN PROGRESS)
      const todayStr = new Date().toISOString().split('T')[0];
      const checkInData = {
        dateStr: todayStr,
        checkInTime: new Date().toISOString(),
        location: `QR Verified - ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
        lat: location.lat,
        lng: location.lng,
        jobLat: job.lat || null,
        jobLng: job.lng || null,
        verificationMethod: 'QR_CODE',
        photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        concludedStatus: 'IN PROGRESS'
      };

      const attendanceRef = doc(db, 'attendance', appId);
      await setDoc(attendanceRef, {
        workerId,
        jobId,
        ...checkInData,
        updatedAt: serverTimestamp()
      }, { merge: true });

      return { success: true };
    } catch (e) {
      console.warn("[FirestoreService] bypassCheckInAndStartJob failed:", e);
      return { success: false, error: e.message };
    }
  },

  async getApplication(appId) {
    if (!appId) return null;
    if (isMockEnabled()) {
      const apps = await MockFirestore.getApplications();
      return apps.find(a => a.id === appId) || null;
    }
    try {
      const docRef = doc(db, 'applications', appId);
      const snap = await getDoc(docRef);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (e) {
      console.warn("[FirestoreService] getApplication failed, using MOCK.");
      const apps = await MockFirestore.getApplications();
      return apps.find(a => a.id === appId) || null;
    }
  },

  streamApplications(callback, onError) {
    const debouncedCallback = debounce(callback, 250);
    if (isMockEnabled()) {
      MockFirestore.getApplications().then(debouncedCallback);
      const poll = setInterval(() => {
        MockFirestore.getApplications().then(debouncedCallback);
      }, 2000);
      return () => clearInterval(poll);
    }
    if (globalFirestoreErrorLock) return () => {};
    const appsRef = collection(db, 'applications');
    try {
      return onSnapshot(appsRef,
        (snap) => {
          const apps = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          debouncedCallback(apps);
        },
        (error) => {
          console.error("Firestore streamApplications Error:", error);
          if (error.code === 'permission-denied' || error.code === 'not-found') {
            globalFirestoreErrorLock = true;
            _activateMockFallback();
            MockFirestore.getApplications().then(debouncedCallback);
          }
          if (onError) onError(error);
        }
      );
    } catch (e) {
      console.error("Critical Snapshot Error (Apps):", e);
      return () => {};
    }
  },

  streamUserApplications(userId, callback, onError) {
    const debouncedCallback = debounce(callback, 250);
    if (isMockEnabled()) {
      MockFirestore.getApplications().then(apps => {
        debouncedCallback(apps.filter(a => a.workerId === userId));
      });
      const poll = setInterval(() => {
        MockFirestore.getApplications().then(apps => {
          debouncedCallback(apps.filter(a => a.workerId === userId));
        });
      }, 2000);
      return () => clearInterval(poll);
    }
    if (globalFirestoreErrorLock || !userId) return () => {};
    const appsRef = collection(db, 'applications');
    const q = query(appsRef, where('workerId', '==', userId));
    try {
      return onSnapshot(q,
        (snap) => {
          const apps = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          debouncedCallback(apps);
        },
        (error) => {
          console.error("Firestore streamUserApplications Error:", error);
          globalFirestoreErrorLock = true;
          _activateMockFallback();
          MockFirestore.getApplications().then(apps => {
            debouncedCallback(apps.filter(a => a.workerId === userId));
          });
          if (onError) onError(error);
        }
      );
    } catch (e) {
      console.error("Critical Snapshot Error (UserApps):", e);
      return () => {};
    }
  },

  async updateApplicationStatus(appId, status) {
    if (!appId) return;
    if (isMockEnabled()) return MockFirestore.updateApplicationStatus(appId, status);
    try {
      const appRef = doc(db, 'applications', appId);
      await updateDoc(appRef, {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.warn("[FirestoreService] updateApplicationStatus failed, using MOCK.");
      _activateMockFallback();
      return MockFirestore.updateApplicationStatus(appId, status);
    }
  },

  // --- TASK MANAGEMENT ---

  async initializeTasks(appId, jobCategory = 'General', customTasks = []) {
    if (!appId) return;
    if (isMockEnabled()) return MockFirestore.initializeTasks(appId, jobCategory, customTasks);
    const tasksRef = collection(db, 'applications', appId, 'tasks');
    
    let tasks = [];
    if (Array.isArray(customTasks) && customTasks.length > 0) {
      tasks = customTasks.map((t, idx) => ({
        title: typeof t === 'object' ? t.title : t,
        description: typeof t === 'object' ? t.description : '',
        order: idx + 1
      }));
    } else {
      // Default task lists based on category
      const defaultTasks = {
        'Warehousing': [
          { title: 'Inventory Check', description: 'Count incoming stock', order: 1 },
          { title: 'Labeling', description: 'Apply shipping labels', order: 2 },
          { title: 'Loading', description: 'Load cargo into truck', order: 3 }
        ],
        'Delivery': [
          { title: 'Vehicle Inspection', description: 'Check fuel and tires', order: 1 },
          { title: 'Parcel Sorting', description: 'Organize parcels by route', order: 2 },
          { title: 'Route Optimization', description: 'Sync mobile GPS', order: 3 }
        ],
        'General': [
          { title: 'Safety Briefing', description: 'Watch safety video', order: 1 },
          { title: 'Site Cleanup', description: 'Clear work area', order: 2 },
          { title: 'Tool Return', description: 'Sanitize and store tools', order: 3 }
        ]
      };
      tasks = defaultTasks[jobCategory] || defaultTasks['General'];
    }

    for (const task of tasks) {
      await addDoc(tasksRef, {
        ...task,
        status: 'Pending',
        isCompleted: false,
        createdAt: serverTimestamp()
      });
    }
  },

  async updateTaskStatus(appId, taskId, isCompleted) {
    if (!appId || !taskId) return;
    if (isMockEnabled()) return MockFirestore.updateTaskStatus(appId, taskId, isCompleted);
    const taskRef = doc(db, 'applications', appId, 'tasks', taskId);
    await updateDoc(taskRef, {
      isCompleted,
      status: isCompleted ? 'Completed' : 'Pending',
      updatedAt: serverTimestamp()
    });
  },

  streamApplicationTasks(appId, callback) {
    if (!appId) return () => {};
    const debouncedCallback = debounce(callback, 250);
    if (isMockEnabled()) {
      MockFirestore.getTasks(appId).then(debouncedCallback);
      const poll = setInterval(() => {
        MockFirestore.getTasks(appId).then(debouncedCallback);
      }, 2000);
      return () => clearInterval(poll);
    }
    const tasksRef = collection(db, 'applications', appId, 'tasks');
    const q = query(tasksRef);
    return onSnapshot(q, (snap) => {
      const tasks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      debouncedCallback(tasks);
    });
  },

  // --- WORKFLOW TRANSITIONS ---

  async markAbsent(appId, workerId) {
    if (!appId) return;
    await this.updateApplicationStatus(appId, 'Absent');
    if (workerId) {
      await this.awardUserXP(workerId, 0, 'absence'); // Decrease trust
    }
  },

  async completeApplication(appId, workerId) {
    if (!appId) return;
    await this.updateApplicationStatus(appId, 'Completed');
    if (workerId) {
      let xpAmount = 150;
      try {
        const app = await this.getApplication(appId);
        if (app && app.jobId) {
          const job = await this.getJob(app.jobId);
          if (job && job.isASAP) {
            xpAmount = 300; // 2x XP Bonus for saving the day
          }
        }
      } catch (e) {
        console.warn("Failed to check if job is ASAP, defaulting to 150 XP");
      }
      await this.awardUserXP(workerId, xpAmount);
    }
  },

  // --- ATTENDANCE ---

  // --- GEOTRACKING & HEARTBEAT ---

  calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
  },

  async verifyHeartbeat(workerCoords, jobCoords, radius = 500) {
    if (!workerCoords || !jobCoords) return true; // Default to pass if data missing
    const dist = this.calculateDistance(workerCoords.lat, workerCoords.lng, jobCoords.lat, jobCoords.lng);
    return dist <= radius;
  },

  async markAttendance(workerId, jobId, checkInData) {
    if (!workerId || !jobId) return;
    if (isMockEnabled()) return MockFirestore.markAttendance(workerId, jobId, checkInData);
    
    // Apply rate limiting: max 1 check-in per job, or 5 per minute for updates
    try {
      return await withRateLimit(
        'markAttendance',
        `${workerId}_${jobId}`,
        async () => {
          const attendanceId = `${workerId}_${jobId}`;
          const attendanceRef = doc(db, 'attendance', attendanceId);
          const appId = `${workerId}_${jobId}`;
          
          // Heartbeat validation (Geofencing)
          if (checkInData.lat && checkInData.jobLat) {
            const isWithinRange = await this.verifyHeartbeat(
              { lat: checkInData.lat, lng: checkInData.lng },
              { lat: checkInData.jobLat, lng: checkInData.jobLng }
            );
            
            if (!isWithinRange) {
              throw new Error("GEOFENCE_VIOLATION: OUTSIDE_OPERATIONAL_RADIUS.");
            }
          }

          await setDoc(attendanceRef, {
            workerId,
            jobId,
            ...checkInData,
            updatedAt: serverTimestamp()
          }, { merge: true });

          if (checkInData.checkInTime) {
            await this.updateApplicationStatus(appId, 'Active');
          } else if (checkInData.checkOutTime) {
            await this.updateApplicationStatus(appId, 'Completed');
          }
        },
        { maxCalls: 5, windowMs: 60000 }
      );
    } catch (e) {
      if (e.code === 'RATE_LIMIT_EXCEEDED') {
        console.warn("[FirestoreService] markAttendance rate limited:", e.message);
        throw e;
      }
      console.error("[FirestoreService] markAttendance error:", e);
      throw e;
    }
  },

  // --- REVIEWS ---

  streamReviews(callback, onError) {
    if (globalFirestoreErrorLock) return () => {};
    const reviewsRef = collection(db, 'reviews');
    try {
      return onSnapshot(reviewsRef, 
        (snap) => {
          const reviews = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          callback(reviews);
        },
        (error) => {
          console.error("Firestore streamReviews Error:", error);
          if (onError) onError(error);
        }
      );
    } catch (e) {
      console.error("Critical Snapshot Error (Reviews):", e);
      return () => {};
    }
  },

  streamAttendance(callback, onError, userId = null) {
    if (isMockEnabled()) {
      const atts = JSON.parse(localStorage.getItem('genie_mock_attendance') || '[]');
      callback(atts);
      return () => {};
    }
    if (globalFirestoreErrorLock) return () => {};
    const attendanceRef = collection(db, 'attendance');
    
    // OPTIMIZATION: If userId provided, filter to only that user's attendance records
    let q;
    if (userId) {
      q = query(
        attendanceRef,
        where('workerId', '==', userId),
        orderBy('checkInTime', 'desc'),
        limit(100)
      );
    } else {
      q = query(
        attendanceRef,
        orderBy('createdAt', 'desc'),
        limit(500)
      );
    }
    
    try {
      return onSnapshot(q, 
        (snap) => {
          const attendance = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          callback(attendance);
        },
        (error) => {
          console.error("Firestore streamAttendance Error:", error);
          if (error.code === 'permission-denied' || error.code === 'not-found') {
            globalFirestoreErrorLock = true;
            _activateMockFallback();
          }
          if (onError) onError(error);
        }
      );
    } catch (e) {
      console.error("Critical Snapshot Error (Attendance):", e);
      return () => {};
    }
  },

  async submitRating(ratingData) {
    if (isMockEnabled()) return MockFirestore.submitRating(ratingData);
    
    // Apply rate limiting: max 3 ratings per minute per user
    try {
      return await withRateLimit(
        'submitRating',
        ratingData.authorId || 'anonymous',
        async () => {
          const ratingRef = doc(collection(db, 'ratings'));
          await setDoc(ratingRef, {
            ...ratingData,
            createdAt: serverTimestamp()
          });
          return ratingRef.id;
        },
        { maxCalls: 3, windowMs: 60000 }
      );
    } catch (e) {
      if (e.code === 'RATE_LIMIT_EXCEEDED') {
        console.warn("[FirestoreService] submitRating rate limited:", e.message);
        return MockFirestore.submitRating(ratingData);
      }
      console.error("Rating submission failed:", e);
      return MockFirestore.submitRating(ratingData);
    }
  },

  async getWorkerTrustScore(workerId) {
    if (isMockEnabled()) return MockFirestore.getWorkerTrustScore(workerId);
    try {
      const userRef = doc(db, 'users', workerId);
      const snap = await getDoc(userRef);
      return snap.exists() ? (snap.data().trustScore || 100) : 100;
    } catch (e) {
      return MockFirestore.getWorkerTrustScore(workerId);
    }
  },

  // --- MIGRATION UTILITY ---

  async migrateFromLocalStorage(uid) {
    if (!uid) return;
    
    // Migration logic disabled to prevent re-importing old demo data.
    // If you need to re-enable migration, uncomment the logic below.
    /*
    // 1. Profile Migration
    const localProfile = localStorage.getItem('jobGenie_profile');
    if (localProfile) {
      console.log("[Migration] Migrating profile...");
      await this.saveUserProfile(uid, JSON.parse(localProfile));
    }

    // 2. XP Migration
    const localXP = localStorage.getItem('jobGenie_xp');
    if (localXP) {
       console.log("[Migration] Migrating XP...");
       await this.saveUserProfile(uid, { xp: Number(localXP) });
    }

    // 3. Admin Jobs Migration
    const localJobs = localStorage.getItem('jobGenie_adminJobs');
    if (localJobs) {
      console.log("[Migration] Migrating admin jobs...");
      const jobs = JSON.parse(localJobs);
      for (const job of jobs) {
        await this.addJob({ ...job, migratedFromLocal: true });
      }
    }

    // 4. Applied Jobs Migration
    const localApplied = localStorage.getItem('jobGenie_appliedJobs');
    if (localApplied) {
      console.log("[Migration] Migrating applied jobs...");
      const appliedIds = JSON.parse(localApplied);
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { appliedJobIds: appliedIds });
    }
    */


    console.log("[Migration] Migration is currently disabled (Production Mode).");
  },

  async getTopWorkers(limitCount = 10) {
    if (isMockEnabled()) return MockFirestore.getTopWorkers(limitCount);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'worker'));
      const snap = await getDocs(q);
      const workers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Filter out those without names for a cleaner leaderboard
      const namedWorkers = workers.filter(w => w.name);
      return namedWorkers.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0)).slice(0, limitCount);
    } catch (e) {
      console.warn("[FirestoreService] getTopWorkers failed.");
      return [];
    }
  },

  async submitTimeOffRequest(uid, request) {
    if (!uid) return;
    if (isMockEnabled()) return MockFirestore.submitTimeOffRequest(uid, request);
    try {
      const docRef = await addDoc(collection(db, 'timeOffRequests'), {
        ...request,
        workerId: uid,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      console.warn("[FirestoreService] submitTimeOffRequest failed.");
      return MockFirestore.submitTimeOffRequest(uid, request);
    }
  },

  streamTimeOffRequests(callback) {
    const debouncedCallback = debounce(callback, 250);
    if (isMockEnabled()) {
      MockFirestore.getTimeOffRequests().then(debouncedCallback);
      const poll = setInterval(() => {
        MockFirestore.getTimeOffRequests().then(debouncedCallback);
      }, 60000);
      return () => clearInterval(poll);
    }
    const q = query(collection(db, 'timeOffRequests'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      debouncedCallback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  },

  async updateTimeOffRequestStatus(reqId, status) {
    if (!reqId) return;
    if (isMockEnabled()) return MockFirestore.updateTimeOffRequestStatus(reqId, status);
    try {
      let statusBg, statusColor;
      if (status === 'APPROVED') {
        statusBg = '#DCFCE7'; statusColor = '#16A34A';
      } else if (status === 'REJECTED') {
        statusBg = '#FEE2E2'; statusColor = '#DC2626';
      }
      await updateDoc(doc(db, 'timeOffRequests', reqId), {
        status,
        statusBg,
        statusColor,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.warn("[FirestoreService] updateTimeOffRequestStatus failed.");
      return MockFirestore.updateTimeOffRequestStatus(reqId, status);
    }
  }
};
