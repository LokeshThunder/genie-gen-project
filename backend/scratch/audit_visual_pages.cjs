const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:/Users/my pc/.gemini/antigravity-ide/brain/232075f9-81c8-4b07-a1c5-03c078726bf8/';

if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

async function run() {
  console.log("🚀 Launching Puppeteer browser audit...");
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  
  const consoleLogs = [];
  const pageErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    console.log('PAGE LOG:', text);
  });

  page.on('pageerror', err => {
    pageErrors.push(err.message);
    console.error('PAGE ERROR:', err.message);
  });

  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');

  try {
    await page.evaluateOnNewDocument(() => {
      window.IS_E2E_TEST = true;
    });

    console.log("🔗 Navigating to login page...");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    
    // Clear localStorage and set worker role first, and theme to dark (CRED)
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('GENIE_ROLE', 'worker');
      localStorage.setItem('GENIE_THEME', 'dark');
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));

    // Screen 1: Worker Home Screen
    console.log("📸 Capturing Worker Home...");
    const workerHomePath = path.join(artifactDir, 'audit_worker_home.png');
    await page.screenshot({ path: workerHomePath });
    console.log(`Saved: ${workerHomePath}`);

    // Navigate to Find Job screen
    console.log("🔍 Navigating to Find Job...");
    await page.evaluate(() => window.navigateTo('Find Job'));
    await new Promise(r => setTimeout(r, 2000));
    const findJobPath = path.join(artifactDir, 'audit_find_job.png');
    await page.screenshot({ path: findJobPath });
    console.log(`Saved: ${findJobPath}`);

    // Navigate to My Jobs screen
    console.log("💼 Navigating to My Jobs...");
    await page.evaluate(() => window.navigateTo('My Jobs'));
    await new Promise(r => setTimeout(r, 2000));
    const myJobsPath = path.join(artifactDir, 'audit_my_jobs.png');
    await page.screenshot({ path: myJobsPath });
    console.log(`Saved: ${myJobsPath}`);

    // Navigate to Attendance screen
    console.log("⏰ Navigating to Attendance...");
    await page.evaluate(() => window.navigateTo('Attendance', { jobId: 'mock_job_1' }));
    await new Promise(r => setTimeout(r, 2000));
    const attendancePath = path.join(artifactDir, 'audit_attendance.png');
    await page.screenshot({ path: attendancePath });
    console.log(`Saved: ${attendancePath}`);

    // Navigate to Earnings screen
    console.log("💰 Navigating to Earnings...");
    await page.evaluate(() => window.navigateTo('Earnings'));
    await new Promise(r => setTimeout(r, 2000));
    const earningsPath = path.join(artifactDir, 'audit_earnings.png');
    await page.screenshot({ path: earningsPath });
    console.log(`Saved: ${earningsPath}`);

    // Navigate to Profile screen
    console.log("👤 Navigating to Profile...");
    await page.evaluate(() => window.navigateTo('Profile'));
    await new Promise(r => setTimeout(r, 2000));
    const profilePath = path.join(artifactDir, 'audit_profile.png');
    await page.screenshot({ path: profilePath });
    console.log(`Saved: ${profilePath}`);

    // Navigate to Genie AI screen
    console.log("🤖 Navigating to Genie AI Assistant...");
    await page.evaluate(() => window.navigateTo('Genie AI'));
    await new Promise(r => setTimeout(r, 2000));
    const aiPath = path.join(artifactDir, 'audit_genie_ai.png');
    await page.screenshot({ path: aiPath });
    console.log(`Saved: ${aiPath}`);

    // SWITCH ROLE TO ADMIN
    console.log("🔄 Switching to Admin role...");
    await page.evaluate(() => {
      localStorage.setItem('GENIE_ROLE', 'admin');
      location.reload();
    });
    await new Promise(r => setTimeout(r, 3000));

    // Screen: Admin Dashboard
    console.log("📸 Capturing Admin Dashboard...");
    const adminDashPath = path.join(artifactDir, 'audit_admin_dashboard.png');
    await page.screenshot({ path: adminDashPath });
    console.log(`Saved: ${adminDashPath}`);

    // Navigate to Create Job Wizard
    console.log("🪄 Navigating to Create Job wizard...");
    await page.evaluate(() => window.navigateTo('Create'));
    await new Promise(r => setTimeout(r, 2000));
    const createJobPath = path.join(artifactDir, 'audit_create_job.png');
    await page.screenshot({ path: createJobPath });
    console.log(`Saved: ${createJobPath}`);

    // Navigate to Admin Jobs
    console.log("📦 Navigating to Admin Jobs...");
    await page.evaluate(() => window.navigateTo('Jobs'));
    await new Promise(r => setTimeout(r, 2000));
    const adminJobsPath = path.join(artifactDir, 'audit_admin_jobs.png');
    await page.screenshot({ path: adminJobsPath });
    console.log(`Saved: ${adminJobsPath}`);

    // Navigate to Applications list
    console.log("📄 Navigating to Worker Applications...");
    await page.evaluate(() => window.navigateTo('Applications'));
    await new Promise(r => setTimeout(r, 2000));
    const appsPath = path.join(artifactDir, 'audit_worker_applications.png');
    await page.screenshot({ path: appsPath });
    console.log(`Saved: ${appsPath}`);

    // Navigate to Reports screen
    console.log("📊 Navigating to Reports...");
    await page.evaluate(() => window.navigateTo('Reports'));
    await new Promise(r => setTimeout(r, 2000));
    const reportsPath = path.join(artifactDir, 'audit_reports.png');
    await page.screenshot({ path: reportsPath });
    console.log(`Saved: ${reportsPath}`);

    // SWITCH ROLE TO SUPER ADMIN
    console.log("🔄 Switching to Super Admin role...");
    await page.evaluate(() => {
      localStorage.setItem('GENIE_ROLE', 'super_admin');
      location.reload();
    });
    await new Promise(r => setTimeout(r, 3000));

    // Screen: Super Admin Dashboard
    console.log("📸 Capturing Super Admin Dashboard...");
    const superAdminPath = path.join(artifactDir, 'audit_super_admin.png');
    await page.screenshot({ path: superAdminPath });
    console.log(`Saved: ${superAdminPath}`);

    console.log("\n✨ Visual Audit Complete. Saving results...");
    
    const reportData = {
      timestamp: new Date().toISOString(),
      consoleLogs: consoleLogs.slice(-100),
      pageErrors,
      screens: [
        'audit_worker_home.png',
        'audit_find_job.png',
        'audit_my_jobs.png',
        'audit_attendance.png',
        'audit_earnings.png',
        'audit_profile.png',
        'audit_genie_ai.png',
        'audit_admin_dashboard.png',
        'audit_create_job.png',
        'audit_admin_jobs.png',
        'audit_worker_applications.png',
        'audit_reports.png',
        'audit_super_admin.png'
      ]
    };
    fs.writeFileSync(path.join(artifactDir, 'audit_metadata.json'), JSON.stringify(reportData, null, 2));
    console.log("🎉 Visual Audit metadata report saved.");

  } catch (err) {
    console.error("❌ Visual Audit Error:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
