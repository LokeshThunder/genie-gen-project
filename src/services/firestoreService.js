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
  addDoc
} from 'firebase/firestore';

// Global state to prevent recursive SDK crashes on permission errors
let globalFirestoreErrorLock = false;

export const FirestoreService = {
  // --- USERS & PROFILES ---
  
  async awardUserXP(userId, xpAmount) {
    if (!userId) return;
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const currentXP = userData.xp || 0;
        const newXP = currentXP + xpAmount;
        
        // Simple level logic (can be expanded)
        let expLabel = userData.exp || 'New Joiner';
        if (newXP >= 500) expLabel = 'Pro';
        if (newXP >= 1500) expLabel = 'Expert';
        if (newXP >= 4000) expLabel = 'Elite';
        
        await updateDoc(userRef, {
          xp: newXP,
          exp: expLabel,
          updatedAt: serverTimestamp()
        });
        console.log(`[XP Reward] Awarded ${xpAmount} to user ${userId}. New XP: ${newXP}`);
      }
    } catch (e) {
      console.error("Error awarding XP:", e);
    }
  },

  async saveUserProfile(uid, profileData) {
    if (!uid) return;
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  async getUserProfile(uid) {
    if (!uid) return null;
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    
    if (snap.exists()) {
      return snap.data();
    }

    // AUTO-INITIALIZE: If user exists in Firebase Auth but not Firestore, create a default worker profile
    // using legacy localStorage data if available
    const legacyXP = parseInt(localStorage.getItem('jobGenie_xp')) || 0;
    const legacyRole = localStorage.getItem('jobGenie_role') || 'worker';
    
    const initialProfile = {
      role: legacyRole,
      xp: legacyXP,
      tier: 'Bronze',
      points: 100,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(userRef, initialProfile);
    return initialProfile;
  },

  // --- JOBS (ADMIN) ---

  async addJob(jobData) {
    const jobsRef = collection(db, 'jobs');
    const docRef = await addDoc(jobsRef, {
      ...jobData,
      status: 'Live',
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async updateJob(jobId, jobData) {
    const jobRef = doc(db, 'jobs', jobId);
    await updateDoc(jobRef, {
      ...jobData,
      updatedAt: serverTimestamp()
    });
  },

  async getJobs() {
    const jobsRef = collection(db, 'jobs');
    const snap = await getDocs(jobsRef);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  streamJobs(callback, onError) {
    if (globalFirestoreErrorLock) return () => {};
    const jobsRef = collection(db, 'jobs');
    try {
      return onSnapshot(jobsRef, 
        (snap) => {
          const jobs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          callback(jobs);
        },
        (error) => {
          console.error("Firestore streamJobs Error:", error);
          if (error.code === 'permission-denied') {
            globalFirestoreErrorLock = true;
          }
          if (onError) onError(error);
        }
      );
    } catch (e) {
      console.error("Critical Snapshot Error (Jobs):", e);
      return () => {};
    }
  },

  // --- APPLICATIONS (WORKER) ---

  async applyToJob(user, job) {
    if (!user?.uid || !job?.id) return;
    
    // workerId and companyId are REQUIRED by Firestore security rules
    const workerId = user.uid;
    const jobId = job.id;
    const companyId = job.companyId || job.postedBy || 'system_genie'; // Fallback for mock jobs
    
    const appRef = doc(db, 'applications', `${workerId}_${jobId}`);
    
    await setDoc(appRef, {
      workerId,
      jobId,
      companyId,
      workerName: user.displayName || user.name || 'Anonymous Worker',
      // Fields expected by AdminDashboard UI labels
      name: user.displayName || user.name || 'Anonymous Worker',
      img: user.photoURL || user.img || '',
      rating: user.rating || 5.0,
      exp: user.exp || 'New Joiner',
      skills: user.skills || ['General Labor'],
      status: 'Pending',
      appliedAt: serverTimestamp()
    });
    
    // Also update user's applied list for quick lookup
    const userRef = doc(db, 'users', workerId);
    const userSnap = await getDoc(userRef);
    let appliedIds = [];
    if (userSnap.exists()) {
      appliedIds = userSnap.data().appliedJobIds || [];
    }
    if (!appliedIds.includes(jobId)) {
      appliedIds.push(jobId);
      await updateDoc(userRef, { appliedJobIds: appliedIds });
    }
  },

  streamApplications(callback, onError) {
    if (globalFirestoreErrorLock) return () => {};
    const appsRef = collection(db, 'applications');
    try {
      return onSnapshot(appsRef, 
        (snap) => {
          const apps = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          callback(apps);
        },
        (error) => {
          console.error("Firestore streamApplications Error:", error);
          if (error.code === 'permission-denied') {
            globalFirestoreErrorLock = true;
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
    if (globalFirestoreErrorLock || !userId) return () => {};
    const appsRef = collection(db, 'applications');
    const q = query(appsRef, where('workerId', '==', userId));
    
    try {
      return onSnapshot(q, 
        (snap) => {
          const apps = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          callback(apps);
        },
        (error) => {
          console.error("Firestore streamUserApplications Error:", error);
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
    const appRef = doc(db, 'applications', appId);
    await updateDoc(appRef, {
      status,
      updatedAt: serverTimestamp()
    });
  },

  // --- TASK MANAGEMENT ---

  async initializeTasks(appId, jobCategory = 'General') {
    if (!appId) return;
    const tasksRef = collection(db, 'applications', appId, 'tasks');
    
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

    const tasks = defaultTasks[jobCategory] || defaultTasks['General'];

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
    const taskRef = doc(db, 'applications', appId, 'tasks', taskId);
    await updateDoc(taskRef, {
      isCompleted,
      status: isCompleted ? 'Completed' : 'Pending',
      updatedAt: serverTimestamp()
    });
  },

  streamApplicationTasks(appId, callback) {
    if (!appId) return () => {};
    const tasksRef = collection(db, 'applications', appId, 'tasks');
    const q = query(tasksRef); // order by creation if needed
    
    return onSnapshot(q, (snap) => {
      const tasks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(tasks);
    });
  },

  // --- WORKFLOW TRANSITIONS ---

  async markAbsent(appId) {
    if (!appId) return;
    await this.updateApplicationStatus(appId, 'Absent');
    // Logic for penalty or reporting can go here
  },

  async completeApplication(appId, workerId) {
    if (!appId) return;
    await this.updateApplicationStatus(appId, 'Completed');
    if (workerId) {
      await this.awardUserXP(workerId, 150); // Standard XP for job completion
    }
  },

  // --- ATTENDANCE ---

  async markAttendance(workerId, jobId, checkInData) {
    const attendanceId = `${workerId}_${jobId}`;
    const attendanceRef = doc(db, 'attendance', attendanceId);
    
    // Generate appId to update application status
    const appId = `${workerId}_${jobId}`;
    
    await setDoc(attendanceRef, {
      workerId,
      jobId,
      ...checkInData,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // IMPORTANT: When checking in, mark the application as 'Active'
    if (checkInData.checkInTime) {
      await this.updateApplicationStatus(appId, 'Active');
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

  streamAttendance(callback, onError) {
    if (globalFirestoreErrorLock) return () => {};
    const attendanceRef = collection(db, 'attendance');
    try {
      return onSnapshot(attendanceRef, 
        (snap) => {
          const attendance = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          callback(attendance);
        },
        (error) => {
          console.error("Firestore streamAttendance Error:", error);
          if (error.code === 'permission-denied') {
            globalFirestoreErrorLock = true;
          }
          if (onError) onError(error);
        }
      );
    } catch (e) {
      console.error("Critical Snapshot Error (Attendance):", e);
      return () => {};
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
  }
};
