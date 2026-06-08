// Mock localStorage in global scope for Node environment
const store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = val.toString(); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { for (const k in store) delete store[k]; }
};

import { MockFirestore } from './src/services/mockFirestore.js';

async function runTest() {
  console.log("🚀 STARTING END-TO-END APPLICATION WORKFLOW TEST...");
  
  // 1. Initialize empty mock tables
  localStorage.clear();
  localStorage.setItem('genie_mock_data_version', 'v5');
  
  // 2. Define entities
  const adminUser = { uid: 'admin_1', displayName: 'Admin Partner' };
  const workerUser = { uid: 'worker_1', displayName: 'Rahul S.' };
  
  // 3. Create a Job (Admin Scenario)
  console.log("\n1️⃣ STEP 1: Admin posts a new gig...");
  const jobId = await MockFirestore.addJob({
    title: 'WAREHOUSE OPERATIVE',
    category: 'Warehousing',
    wage: 850,
    locationName: 'Adyar Sector',
    companyName: 'GENIE LOGISTICS',
    description: 'Manage stock and fulfill orders.'
  });
  console.log(`✅ Job created successfully! ID: ${jobId}`);
  
  // Verify job exists in database
  const jobs = await MockFirestore.getJobs();
  const job = jobs.find(j => j.id === jobId);
  if (!job) throw new Error("Job not found in database!");
  console.log(`   Verified: "${job.title}" is Live in "${job.locationName}"!`);
  
  // 4. Worker applies for Job (Worker Discovery Scenario)
  console.log("\n2️⃣ STEP 2: Worker discovers and applies for the gig...");
  await MockFirestore.applyToJob(workerUser, job);
  
  // Verify application exists and has 'Pending' status
  const apps = await MockFirestore.getApplications();
  const appId = `${workerUser.uid}_${jobId}`;
  const app = apps.find(a => a.id === appId);
  if (!app) throw new Error("Application not found!");
  if (app.status !== 'Pending') throw new Error(`Application status is ${app.status}, expected Pending!`);
  console.log(`✅ Application created! ID: ${app.id}, Status: ${app.status}`);
  
  // 5. Admin hires worker (Admin Review Scenario)
  console.log("\n3️⃣ STEP 3: Admin reviews candidate pool and hires the worker...");
  await MockFirestore.updateApplicationStatus(appId, 'Approved');
  
  // Verify status is 'Approved'
  const appsAfterHire = await MockFirestore.getApplications();
  const appAfterHire = appsAfterHire.find(a => a.id === appId);
  if (appAfterHire.status !== 'Approved') throw new Error(`Application status is ${appAfterHire.status}, expected Approved!`);
  console.log(`✅ Worker hired! Application status updated to: ${appAfterHire.status}`);
  
  // 6. Worker starts shift / Check-In (Tactical Deployment Scenario)
  console.log("\n4️⃣ STEP 4: Worker arrives at site, scans biometrics and checks in...");
  await MockFirestore.markAttendance(workerUser.uid, jobId, {
    checkInTime: new Date().toISOString(),
    location: 'Verified Adyar Hub',
    lat: 12.9716,
    lng: 77.5946,
    concludedStatus: 'IN PROGRESS'
  });
  
  // Verify overarching application status transitioned to 'Active'
  const appsAfterCheckin = await MockFirestore.getApplications();
  const appAfterCheckin = appsAfterCheckin.find(a => a.id === appId);
  if (appAfterCheckin.status !== 'Active') throw new Error(`Application status is ${appAfterCheckin.status}, expected Active!`);
  console.log(`✅ Check-In successful! Attendance recorded. Overarching status transitioned to: ${appAfterCheckin.status}`);
  
  // 7. Worker completes shift / Check-Out (Job Completion Scenario)
  console.log("\n5️⃣ STEP 5: Worker completes shift, scans biometrics and checks out...");
  await MockFirestore.markAttendance(workerUser.uid, jobId, {
    checkOutTime: new Date().toISOString(),
    location: 'Verified Adyar Hub',
    lat: 12.9718,
    lng: 77.5948,
    concludedStatus: 'COMPLETED'
  });
  
  // Verify overarching application status transitioned to 'Completed'
  const appsAfterCheckout = await MockFirestore.getApplications();
  const appAfterCheckout = appsAfterCheckout.find(a => a.id === appId);
  if (appAfterCheckout.status !== 'Completed') throw new Error(`Application status is ${appAfterCheckout.status}, expected Completed!`);
  console.log(`✅ Check-Out successful! Overarching status successfully transitioned to: ${appAfterCheckout.status}`);
  
  // 8. Submit rating/review (Final Feedback Scenario)
  console.log("\n6️⃣ STEP 6: Worker rates the employer...");
  const ratingId = await MockFirestore.submitRating({
    workerId: workerUser.uid,
    jobId: jobId,
    stars: 5,
    comment: 'Excellent team and workplace!'
  });
  
  // Verify rating stored in database
  const ratings = JSON.parse(localStorage.getItem('genie_mock_ratings') || '[]');
  const rating = ratings.find(r => r.id === ratingId);
  if (!rating) throw new Error("Rating not found in database!");
  console.log(`✅ Rating submitted successfully! Rated stars: ${rating.stars}/5`);
  
  console.log("\n✨ ===================================================");
  console.log("🎉 ALL END-TO-END SCENARIOS PASSED WITH 100% SUCCESS!");
  console.log("===================================================\n");
}

runTest().catch(err => {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
});
