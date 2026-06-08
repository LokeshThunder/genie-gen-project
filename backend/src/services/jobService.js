import { FirestoreService } from './firestoreService';
import { db } from './firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const SYNC_QUEUE_KEY = 'genie_sync_queue';

export const JobService = {
  // Sync Logic
  getQueue: () => {
    try {
      return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    } catch (e) {
      console.error("Error parsing sync queue:", e);
      return [];
    }
  },
  
  addToQueue: (action, data) => {
    const queue = JobService.getQueue();
    queue.push({ id: Date.now(), action, data, timestamp: new Date().toISOString() });
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    console.log(`[Offline Sync] Action queued: ${action}`);
  },

  processSync: async (userId) => {
    const queue = JobService.getQueue();
    if (queue.length === 0) return;
    
    console.log(`[Offline Sync] Processing ${queue.length} items...`);
    const remainingQueue = [];

    for (const item of queue) {
      try {
        if (item.action === 'checkIn') {
          await FirestoreService.markAttendance(userId, item.data.jobId, {
            checkInTime: item.timestamp,
            location: item.data.location,
            lat: item.data.lat,
            lng: item.data.lng,
            distanceDiff: item.data.distanceDiff || null,
            photo: item.data.photo || '',
            concludedStatus: 'IN PROGRESS'
          });
        } else if (item.action === 'checkOut') {
          await FirestoreService.markAttendance(userId, item.data.jobId, {
            checkOutTime: item.timestamp,
            location: item.data.location,
            lat: item.data.lat,
            lng: item.data.lng,
            photo: item.data.photo || '',
            concludedStatus: 'COMPLETED'
          });
          // Also award XP
          await FirestoreService.awardUserXP(userId, 150);
        }
      } catch (e) {
        console.error(`[Offline Sync] Failed to sync item ${item.id}:`, e);
        remainingQueue.push(item);
      }
    }
    
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remainingQueue));
    console.log(`[Offline Sync] Sync complete. ${remainingQueue.length} items remaining.`);
  },

  // Return real gigs from Firestore
  getGigs: async () => {
    return await FirestoreService.getJobs();
  },

  // Return real applications for user
  getMyApplications: async (userId) => {
    if (!userId) return [];
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';
    if (isMock) {
      const allApps = JSON.parse(localStorage.getItem('genie_mock_applications') || '[]');
      return allApps.filter(a => a.workerId === userId);
    }
    const appsRef = collection(db, 'applications');
    const q = query(appsRef, where('workerId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Return real active jobs (Approved/Active status)
  getActiveJobs: async (userId) => {
    if (!userId) return [];
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';
    if (isMock) {
      const allApps = JSON.parse(localStorage.getItem('genie_mock_applications') || '[]');
      return allApps.filter(a => a.workerId === userId && ['Approved', 'Active'].includes(a.status));
    }
    const appsRef = collection(db, 'applications');
    const q = query(appsRef, where('workerId', '==', userId), where('status', 'in', ['Approved', 'Active']));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Attendance Actions
  checkIn: async (userId, jobId, photo, location, jobCoords = null, distanceDiff = null) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const checkInData = {
      dateStr: todayStr,
      checkInTime: new Date().toISOString(),
      location: typeof location === 'string' ? location : 'Verified Site',
      lat: location?.lat || null,
      lng: location?.lng || null,
      jobLat: jobCoords?.lat || null,
      jobLng: jobCoords?.lng || null,
      distanceDiff,
      photo: photo || '',
      concludedStatus: 'IN PROGRESS'
    };

    if (!navigator.onLine) {
      JobService.addToQueue('checkIn', { jobId, location: checkInData.location, lat: checkInData.lat, lng: checkInData.lng, photo: checkInData.photo, distanceDiff: checkInData.distanceDiff });
      return { success: true, offline: true, time: new Date().toLocaleTimeString() };
    }
    
    try {
      await FirestoreService.markAttendance(userId, jobId, checkInData);
      return { success: true, time: new Date().toLocaleTimeString() };
    } catch (e) {
      console.error("CheckIn Error:", e);
      return { success: false, error: e.message };
    }
  },

  checkOut: async (userId, jobId, photo, location, jobCoords = null) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const checkOutData = {
      dateStr: todayStr,
      checkOutTime: new Date().toISOString(),
      location: typeof location === 'string' ? location : 'Verified Site',
      lat: location?.lat || null,
      lng: location?.lng || null,
      jobLat: jobCoords?.lat || null,
      jobLng: jobCoords?.lng || null,
      photo: photo || '',
      concludedStatus: 'COMPLETED'
    };

    if (!navigator.onLine) {
      JobService.addToQueue('checkOut', { jobId, location: checkOutData.location, lat: checkOutData.lat, lng: checkOutData.lng, photo: checkOutData.photo });
      return { success: true, offline: true, earnings: 0 };
    }

    try {
      await FirestoreService.markAttendance(userId, jobId, checkOutData);
      await FirestoreService.awardUserXP(userId, 150);
      return { success: true, earnings: 150 }; // Simplified earnings as XP for now
    } catch (e) {
      console.error("CheckOut Error:", e);
      return { success: false, error: e.message };
    }
  },

  // Return empty array for tasks
  getTasks: async () => {
    return [];
  },

  // Earnings Logic - Real-time calculation from attendance
  getEarnings: async (userId) => {
    if (!userId) return { total: 0, breakdown: [] };
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';
    let attendanceRecords = [];
    if (isMock) {
      const atts = JSON.parse(localStorage.getItem('genie_mock_attendance') || '[]');
      attendanceRecords = atts.filter(a => a.workerId === userId);
    } else {
      const attendanceRef = collection(db, 'attendance');
      const q = query(attendanceRef, where('workerId', '==', userId));
      const snap = await getDocs(q);
      attendanceRecords = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    let total = 0;
    const breakdown = attendanceRecords.map((data, idx) => {
      const amount = (data.concludedStatus === 'COMPLETED' || data.concludedStatus === 'FINISHED') ? 150 : 0; 
      total += amount;
      
      let dateVal = new Date();
      if (data.updatedAt) {
        if (typeof data.updatedAt.toDate === 'function') {
          dateVal = data.updatedAt.toDate();
        } else {
          dateVal = new Date(data.updatedAt);
        }
      }
      
      return {
        id: data.id || `att_earning_${idx}`,
        job: data.jobTitle || 'Gig Completed',
        amount,
        date: dateVal,
      };
    }).filter(i => i.amount > 0);

    return { total, breakdown };
  },

  // Absent Logic
  markMissedDaysAsAbsent: async (userId, jobId, jobDetails) => {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';
    let records = [];
    let atts = [];
    if (isMock) {
      atts = JSON.parse(localStorage.getItem('genie_mock_attendance') || '[]');
      records = atts.filter(r => r.workerId === userId && r.jobId === jobId);
    } else {
      const attendanceRef = collection(db, 'attendance');
      const q = query(attendanceRef, where('workerId', '==', userId), where('jobId', '==', jobId));
      const snap = await getDocs(q);
      records = snap.docs.map(d => d.data());
    }
    
    const { recurringDays, type } = jobDetails;
    if (!recurringDays || recurringDays.length === 0 || !['full-time', 'part-time'].includes(type)) return;
    
    // Check last 7 days for demo purposes
    const today = new Date();
    let changed = false;
    for (let i = 1; i <= 7; i++) {
       const d = new Date(today);
       d.setDate(d.getDate() - i);
       const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
       if (recurringDays.includes(dayName)) {
          // Check if there is a record for this day
          const dateStr = d.toISOString().split('T')[0];
          const hasRecord = records.some(r => r.dateStr === dateStr);
          if (!hasRecord) {
             // Mark absent
             if (isMock) {
                atts.push({
                   id: `mock_absent_${userId}_${jobId}_${dateStr}`,
                   workerId: userId,
                   jobId: jobId,
                   dateStr,
                   concludedStatus: 'ABSENT',
                   checkInTime: null,
                   checkOutTime: null,
                   jobTitle: jobDetails.title,
                   updatedAt: new Date().toISOString()
                });
                changed = true;
             } else {
                await FirestoreService.markAttendance(userId, jobId, {
                   dateStr,
                   concludedStatus: 'ABSENT',
                   checkInTime: null,
                   checkOutTime: null,
                   jobTitle: jobDetails.title
                });
             }
          }
       }
    }
    if (isMock && changed) {
      localStorage.setItem('genie_mock_attendance', JSON.stringify(atts));
    }
  }
};
