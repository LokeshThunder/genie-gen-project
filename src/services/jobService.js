/**
 * JobService - Backend service for Job Genie
 * Handles jobs, applications, attendance, and earnings.
 */

const SYNC_QUEUE_KEY = 'genie_sync_queue';

export const AVAILABLE_GIGS = [
  { id: "gig_001", title: "Warehouse Packer", company: "Zomato Hyperpure", loc: "Madipakkam, Chennai", pay: "₹850", payFreq: "PER DAY", distance: "2.4 KM", time: "09:00 - 18:00", shift: "DAY", color: "#E11D48", urgent: true, category: "Warehousing" },
  { id: "gig_002", title: "Delivery Partner", company: "Swiggy Instamart", loc: "Velachery, Chennai", pay: "₹700", payFreq: "PER DAY", distance: "4.1 KM", time: "18:00 - 02:00", shift: "NIGHT", color: "#F59E0B", perfectMatch: true, category: "Delivery" },
  { id: "gig_003", title: "Site Security", company: "G4S Solutions", loc: "Madipakkam, Chennai", pay: "₹950", payFreq: "PER DAY", distance: "1.8 KM", time: "20:00 - 06:00", shift: "NIGHT", color: "#1E293B", category: "Security" },
  { id: "gig_004", title: "Retail Assistant", company: "Reliance Smart", loc: "T. Nagar, Chennai", pay: "₹600", payFreq: "PER DAY", distance: "8.5 KM", time: "10:00 - 19:00", shift: "DAY", color: "#06B6D4", category: "Retail" },
  { id: "gig_005", title: "Inventory Manager", company: "Amazon Flex", loc: "Guindy, Chennai", pay: "₹1200", payFreq: "PER DAY", distance: "5.2 KM", time: "08:00 - 17:00", shift: "DAY", color: "#F97316", urgent: true, category: "Warehousing" }
];

export const JobService = {
  // Sync Logic
  getQueue: () => JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]'),
  
  addToQueue: (action, data) => {
    const queue = JobService.getQueue();
    queue.push({ id: Date.now(), action, data, timestamp: new Date().toISOString() });
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    console.log(`[Offline Sync] Action queued: ${action}`);
  },

  processSync: async () => {
    const queue = JobService.getQueue();
    if (queue.length === 0) return;
    
    console.log(`[Offline Sync] Processing ${queue.length} items...`);
    // In a real app, we would loop and call the API here
    localStorage.setItem(SYNC_QUEUE_KEY, '[]');
    console.log(`[Offline Sync] Processed successfully.`);
  },

  // Return real gigs
  getGigs: async () => {
    return AVAILABLE_GIGS;
  },

  // Return empty array for applications
  getMyApplications: async () => {
    return [];
  },

  // Return empty array for active jobs
  getActiveJobs: async () => {
    return [];
  },

  // Attendance Actions
  checkIn: async (jobId, photo, location) => {
    if (!navigator.onLine) {
      JobService.addToQueue('checkIn', { jobId, location });
      return { success: true, offline: true, time: new Date().toLocaleTimeString() };
    }
    console.log(`Checking in for job ${jobId} at`, location);
    return { success: true, time: new Date().toLocaleTimeString() };
  },

  checkOut: async (jobId, photo, location) => {
    if (!navigator.onLine) {
      JobService.addToQueue('checkOut', { jobId, location });
      return { success: true, offline: true, earnings: 0 };
    }
    console.log(`Checking out from job ${jobId} at`, location);
    return { success: true, earnings: 0 };
  },

  // Return empty array for tasks
  getTasks: async (jobId) => {
    return [];
  },

  // Return zeroed earnings
  getEarnings: async () => {
    return {
      total: 0,
      breakdown: []
    };
  }
};
