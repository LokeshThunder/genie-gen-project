/**
 * MockFirestore provides a LocalStorage-backed implementation of essential Firestore logic.
 * This is used as a fallback when the real Firestore database is not provisioned or reachable.
 */
const STORAGE_PREFIX = 'genie_mock_';
const MOCK_DATA_VERSION = 'v7'; // bumped to force clear out old demo data

const getStorage = (key) => {
  const data = localStorage.getItem(STORAGE_PREFIX + key);
  return data ? JSON.parse(data) : [];
};

const setStorage = (key, data) => {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
};

const updateWorkerTrustScore = (workerId) => {
  const ratings = getStorage('ratings').filter(r => r.workerId === workerId);
  if (ratings.length === 0) return 100; // New workers start at 100
  const sum = ratings.reduce((acc, r) => acc + r.stars, 0);
  const avg = sum / ratings.length;
  // Convert 1-5 stars to 0-100 percentage
  return Math.round((avg / 5) * 100);
};

export const MockFirestore = {
  async addJob(jobData) {
    const jobs = getStorage('jobs');
    const newJob = { 
      ...jobData, 
      id: 'mock_job_' + Math.random().toString(36).substr(2, 9), 
      status: 'Live', 
      createdAt: new Date().toISOString() 
    };
    jobs.push(newJob);
    setStorage('jobs', jobs);
    console.warn("[MockFirestore] Job added:", newJob.id);
    return newJob.id;
  },

  async getJobs() {
    // Force reseed when MOCK_DATA_VERSION changes
    const savedVersion = localStorage.getItem(STORAGE_PREFIX + 'data_version');
    if (savedVersion !== MOCK_DATA_VERSION) {
      localStorage.removeItem(STORAGE_PREFIX + 'jobs');
      localStorage.removeItem(STORAGE_PREFIX + 'attendance');
      localStorage.removeItem(STORAGE_PREFIX + 'applications');
      localStorage.setItem(STORAGE_PREFIX + 'data_version', MOCK_DATA_VERSION);
    }
    const jobs = getStorage('jobs');
    return jobs;
  },

  async applyToJob(user, job) {
    const apps = getStorage('applications');
    const appId = `${user.uid}_${job.id}`;
    if (apps.find(a => a.id === appId)) return;

    const newApp = {
      id: appId,
      workerId: user.uid,
      jobId: job.id,
      companyId: job.companyId || 'mock_co',
      workerName: user.displayName || 'Worker',
      name: user.displayName || 'Worker',
      jobTitle: job.title,
      status: 'Pending',
      appliedAt: new Date().toISOString()
    };
    apps.push(newApp);
    setStorage('applications', apps);

    // Update user profile appliedJobIds
    const users = getStorage('users');
    const uIdx = users.findIndex(u => u.uid === user.uid);
    if (uIdx !== -1) {
      if (!users[uIdx].appliedJobIds) users[uIdx].appliedJobIds = [];
      if (!users[uIdx].appliedJobIds.includes(job.id)) {
        users[uIdx].appliedJobIds.push(job.id);
      }
      setStorage('users', users);
    }
    
    console.warn("[MockFirestore] Application added and profile updated:", appId);
  },

  async bypassCheckInAndStartJob(user, job, location = { lat: 12.9716, lng: 77.5946 }) {
    const apps = getStorage('applications');
    const appId = `${user.uid}_${job.id}`;
    
    // Create/update active application
    const existingAppIdx = apps.findIndex(a => a.id === appId);
    const appData = {
      id: appId,
      workerId: user.uid,
      jobId: job.id,
      companyId: job.companyId || 'mock_co',
      workerName: user.displayName || 'Worker',
      name: user.displayName || 'Worker',
      jobTitle: job.title,
      status: 'Active',
      appliedAt: new Date().toISOString()
    };
    if (existingAppIdx !== -1) {
      apps[existingAppIdx] = appData;
    } else {
      apps.push(appData);
    }
    setStorage('applications', apps);

    // Update user profile appliedJobIds
    const users = getStorage('users');
    const uIdx = users.findIndex(u => u.uid === user.uid);
    if (uIdx !== -1) {
      if (!users[uIdx].appliedJobIds) users[uIdx].appliedJobIds = [];
      if (!users[uIdx].appliedJobIds.includes(job.id)) {
        users[uIdx].appliedJobIds.push(job.id);
      }
      setStorage('users', users);
    }

    // Initialize tasks
    await this.initializeTasks(appId, job.category || 'General', job.customTasks || []);

    // Create attendance checked in
    const todayStr = new Date().toISOString().split('T')[0];
    const checkInData = {
      dateStr: todayStr,
      checkInTime: new Date().toISOString(),
      location: 'QR Code Verification Site',
      lat: location?.lat || job.lat || 12.9716,
      lng: location?.lng || job.lng || 77.5946,
      jobLat: job.lat || null,
      jobLng: job.lng || null,
      photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      concludedStatus: 'IN PROGRESS'
    };
    
    const atts = getStorage('attendance');
    const attIdx = atts.findIndex(a => a.id === appId);
    if (attIdx !== -1) {
      atts[attIdx] = { ...atts[attIdx], ...checkInData, updatedAt: new Date().toISOString() };
    } else {
      atts.push({ id: appId, workerId: user.uid, jobId: job.id, ...checkInData, createdAt: new Date().toISOString() });
    }
    setStorage('attendance', atts);

    console.warn("[MockFirestore] QR Bypass checked-in & initialized tasks for:", appId);
    return { success: true };
  },


  async getApplications() {
    return getStorage('applications');
  },

  async updateApplicationStatus(appId, status) {
    const apps = getStorage('applications');
    const idx = apps.findIndex(a => a.id === appId);
    if (idx !== -1) {
      apps[idx].status = status;
      setStorage('applications', apps);
    }
  },

  async getUserProfile(uid) {
    const users = getStorage('users');
    let user = users.find(u => u.uid === uid);

    // Auto-correct pre-existing test accounts that were corrupted/defaulted in previous sessions
    if (user) {
      let expectedRole = null;
      if (uid === 'test_admin_id') expectedRole = 'admin';
      else if (uid === 'test_super_admin_id') expectedRole = 'super_admin';
      else if (uid === 'test_worker_id') expectedRole = 'worker';

      if (expectedRole && user.role !== expectedRole) {
        user.role = expectedRole;
        user.onboardingCompleted = true;
        setStorage('users', users);
        console.warn(`[MockFirestore] Auto-corrected role for test user ${uid} to ${expectedRole}`);
      }
    }

    if (!user) {
      if (uid === 'test_worker_id' || uid === 'test_admin_id' || uid === 'test_super_admin_id') {
        let role = 'worker';
        if (uid === 'test_admin_id') role = 'admin';
        if (uid === 'test_super_admin_id') role = 'super_admin';

        user = {
          uid,
          xp: 1000,
          exp: uid === 'test_super_admin_id' ? 'Elite' : 'Pro',
          role,
          name: uid === 'test_super_admin_id' ? 'Super Admin' : (uid === 'test_admin_id' ? 'Genie Partner' : 'Genie Worker'),
          onboardingCompleted: true,
          ...(uid === 'test_worker_id' ? {
            dob: '1995-08-15',
            gender: 'Male',
            experience: '3 Years',
            preferredAreas: 'Chennai, Bangalore',
            skills: ['DELIVERY', 'LOGISTICS', 'SUPPORT'],
            phone: '+91 98765 43210',
            aboutMe: 'I have 3 years of warehouse loading and delivery experience.',
            employmentType: 'full_time'
          } : {})
        };
        users.push(user);
        setStorage('users', users);
        return user;
      }
      return null;
    }
    return user;
  },

  async saveUserProfile(uid, profileData) {
    const users = getStorage('users');
    const idx = users.findIndex(u => u.uid === uid);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...profileData, updatedAt: new Date().toISOString() };
    } else {
      users.push({ uid, ...profileData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setStorage('users', users);
    console.warn("[MockFirestore] Saved user profile:", uid, profileData);
  },

  async submitRating(ratingData) {
    const ratings = getStorage('ratings');
    const newRating = {
      ...ratingData,
      id: 'rating_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    ratings.push(newRating);
    setStorage('ratings', ratings);
    
    // Update worker's trust score in mock users
    const users = getStorage('users');
    const userIdx = users.findIndex(u => u.uid === ratingData.workerId);
    if (userIdx !== -1) {
      // Simple mock logic for trust score update
      const currentScore = users[userIdx].trustScore || 100;
      users[userIdx].trustScore = Math.min(100, Math.max(0, currentScore + (ratingData.rating >= 4 ? 2 : -5)));
      setStorage('users', users);
    }
    
    return newRating.id;
  },

  async getWorkerTrustScore(workerId) {
    const users = getStorage('users');
    const user = users.find(u => u.uid === workerId);
    return user?.trustScore || 100;
  },

  async awardUserXP(uid, amount) {
    const users = getStorage('users');
    const idx = users.findIndex(u => u.uid === uid);
    if (idx !== -1) {
      users[idx].xp = (users[idx].xp || 0) + amount;
      setStorage('users', users);
    }
  },

  async markAttendance(uid, jobId, data) {
    const atts = getStorage('attendance');
    const attId = `${uid}_${jobId}`;
    const idx = atts.findIndex(a => a.id === attId);
    
    if (idx !== -1) {
      atts[idx] = { ...atts[idx], ...data, updatedAt: new Date().toISOString() };
    } else {
      atts.push({ id: attId, workerId: uid, jobId, ...data, createdAt: new Date().toISOString() });
    }
    setStorage('attendance', atts);

    const appId = `${uid}_${jobId}`;
    if (data.checkInTime) {
      await this.updateApplicationStatus(appId, 'Active');
    } else if (data.checkOutTime) {
      await this.updateApplicationStatus(appId, 'Completed');
    }
  },

  async initializeTasks(appId, jobCategory = 'General', customTasks = []) {
    const key = `tasks_${appId}`;
    let tasksList = [];
    if (Array.isArray(customTasks) && customTasks.length > 0) {
      tasksList = customTasks.map((t, idx) => ({
        title: typeof t === 'object' ? t.title : t,
        description: typeof t === 'object' ? t.description : '',
        order: idx + 1
      }));
    } else {
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
      tasksList = defaultTasks[jobCategory] || defaultTasks['General'];
    }

    const tasks = tasksList.map((t, i) => ({
      ...t,
      id: `mock_task_${appId}_${i}`,
      status: 'Pending',
      isCompleted: false,
      createdAt: new Date().toISOString()
    }));
    setStorage(key, tasks);
    console.warn("[MockFirestore] Tasks initialized for:", appId);
  },

  async updateTaskStatus(appId, taskId, isCompleted) {
    const key = `tasks_${appId}`;
    const tasks = getStorage(key);
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      tasks[idx].isCompleted = isCompleted;
      tasks[idx].status = isCompleted ? 'Completed' : 'Pending';
      setStorage(key, tasks);
    }
  },

  async getTasks(appId) {
    return getStorage(`tasks_${appId}`);
  },

  async getTopWorkers(limitCount = 10) {
    const users = getStorage('users');
    const workers = users.filter(u => u.role === 'worker' || !u.role);
    return workers.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0)).slice(0, limitCount);
  },

  async submitTimeOffRequest(uid, request) {
    const requests = getStorage('timeOffRequests');
    const newReq = {
      ...request,
      id: 'timeoff_' + Date.now(),
      workerId: uid,
      createdAt: new Date().toISOString()
    };
    requests.push(newReq);
    setStorage('timeOffRequests', requests);
    return newReq.id;
  },

  async getTimeOffRequests() {
    return getStorage('timeOffRequests');
  },

  async updateTimeOffRequestStatus(reqId, status) {
    const requests = getStorage('timeOffRequests');
    const idx = requests.findIndex(r => r.id === reqId);
    if (idx !== -1) {
      requests[idx].status = status;
      if (status === 'APPROVED') {
        requests[idx].statusBg = '#DCFCE7';
        requests[idx].statusColor = '#16A34A';
      } else if (status === 'REJECTED') {
        requests[idx].statusBg = '#FEE2E2';
        requests[idx].statusColor = '#DC2626';
      }
      setStorage('timeOffRequests', requests);
    }
  }
};

// Force Seed Attendance
const forceSeed = () => {
  // Demo data seeding removed
};
forceSeed();
