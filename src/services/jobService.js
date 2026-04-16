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
            concludedStatus: 'IN PROGRESS'
          });
        } else if (item.action === 'checkOut') {
          await FirestoreService.markAttendance(userId, item.data.jobId, {
            checkOutTime: item.timestamp,
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
    const appsRef = collection(db, 'applications');
    const q = query(appsRef, where('workerId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Return real active jobs (Approved/Active status)
  getActiveJobs: async (userId) => {
    if (!userId) return [];
    const appsRef = collection(db, 'applications');
    const q = query(appsRef, where('workerId', '==', userId), where('status', 'in', ['Approved', 'Active']));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Attendance Actions
  checkIn: async (userId, jobId, photo, location) => {
    const checkInData = {
      checkInTime: new Date().toISOString(),
      location: location || 'Unknown',
      photo: photo || '',
      concludedStatus: 'IN PROGRESS'
    };

    if (!navigator.onLine) {
      JobService.addToQueue('checkIn', { jobId, location: checkInData.location });
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

  checkOut: async (userId, jobId, photo, location) => {
    const checkOutData = {
      checkOutTime: new Date().toISOString(),
      location: location || 'Unknown',
      concludedStatus: 'COMPLETED'
    };

    if (!navigator.onLine) {
      JobService.addToQueue('checkOut', { jobId, location: checkOutData.location });
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
    const attendanceRef = collection(db, 'attendance');
    const q = query(attendanceRef, where('workerId', '==', userId));
    const snap = await getDocs(q);
    
    let total = 0;
    const breakdown = snap.docs.map(doc => {
      const data = doc.data();
      const amount = data.concludedStatus === 'COMPLETED' ? 150 : 0; 
      total += amount;
      return {
        id: doc.id,
        job: data.jobTitle || 'Gig Completed',
        amount,
        date: data.updatedAt?.toDate() || new Date(),
      };
    }).filter(i => i.amount > 0);

    return { total, breakdown };
  }
};
