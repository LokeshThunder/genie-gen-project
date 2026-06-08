import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const projectRoot = 'C:/Users/my pc/.gemini/antigravity/scratch/job_genie_react/';

// Helper to delete a file if it exists
function deleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted existing file: ${filePath}`);
  }
}

// Clean up old files
const screenshotNames = [
  'step1_posted.png',
  'step2_applied.png',
  'step3_approved.png',
  'step4_checked_in.png',
  'step5_checked_out.png',
  'step6_settled.png',
  'debug_step1_fail.png'
];
screenshotNames.forEach(name => deleteFile(path.join(projectRoot, name)));

// Delete old Payslip PDFs
fs.readdirSync(projectRoot).forEach(file => {
  if (file.startsWith('PaySlip_') && file.endsWith('.pdf')) {
    deleteFile(path.join(projectRoot, file));
  }
});

async function run() {
  console.log("🚀 Launching Puppeteer E2E test for complete worker gig lifecycle...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');

    // Enable downloading files directly to project root
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: projectRoot
    });

    // Inject E2E test flag on load
    await page.evaluateOnNewDocument(() => {
      window.IS_E2E_TEST = true;
    });

    // 1. Initial navigation as Admin
    console.log("🔗 Navigating to http://localhost:5173/ ...");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    
    // Clear localStorage prefix to start completely fresh
    const navPromise1 = page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    await page.evaluate(() => {
      // Clear mock storage keys
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('genie_mock_') || key === 'GENIE_ROLE')) {
          localStorage.removeItem(key);
        }
      }
      localStorage.setItem('GENIE_ROLE', 'admin');
      location.reload();
    });
    await navPromise1;
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("✅ State cleared. Logged in as Admin.");

    // 2. Click "INITIALIZE ⚡" on the Magic Post card to open CreateJobScreen
    console.log("🪄 Finding and clicking Magic Post card...");
    const clickedMagic = await page.evaluate(() => {
      const icon = document.querySelector('.magic-icon-anim');
      if (icon) {
        const card = icon.closest('.tap-effect');
        if (card) {
          card.click();
          return true;
        }
      }
      // Fallback
      const items = Array.from(document.querySelectorAll('.tap-effect'));
      const found = items.find(el => el.textContent.toUpperCase().includes('INITIALIZE') || el.textContent.toUpperCase().includes('MAGIC POST') || el.textContent.toUpperCase().includes('AI GIG CREATOR') || el.textContent.toUpperCase().includes('FIND WORKERS'));
      if (found) {
        found.click();
        return true;
      }
      return false;
    });

    if (!clickedMagic) {
      await page.screenshot({ path: path.join(projectRoot, 'debug_magic_fail.png') });
      console.log("📸 Saved debug_magic_fail.png");
      throw new Error("Could not find Magic Post card on Admin Dashboard!");
    }
    console.log("✅ Clicked Magic Post card.");

    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. Step 1 of Create Job Wizard: Click "Continue ➔"
    console.log("➡️ Clicking Continue on Step 1...");
    const clickedStep1Continue = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.button-cyan, .tap-effect, .cred-btn-black, .cred-btn-white'));
      const btn = btns.find(b => b.textContent.toUpperCase().includes('CONTINUE'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!clickedStep1Continue) {
      // Dump text content of body to diagnose
      const bodyText = await page.evaluate(() => document.body.innerText);
      console.log("=== Page Body Text on Failure ===");
      console.log(bodyText.substring(0, 1000));
      console.log("================================");
      await page.screenshot({ path: path.join(projectRoot, 'debug_step1_fail.png') });
      console.log("📸 Saved debug_step1_fail.png");
      throw new Error("Could not find Step 1 Continue button!");
    }
    console.log("✅ Navigated to Step 2.");

    await new Promise(resolve => setTimeout(resolve, 1500));

    // 4. Step 2 of Create Job Wizard: Click "AUTO-FILL"
    console.log("✍️ Clicking AUTO-FILL...");
    const clickedAutofill = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.tap-effect'));
      const btn = items.find(el => el.textContent.toUpperCase().includes('AUTO-FILL'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!clickedAutofill) {
      throw new Error("Could not find AUTO-FILL button on Step 2!");
    }
    console.log("✅ Form auto-filled.");

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Click "Continue ➔" to go to Step 3
    console.log("➡️ Clicking Continue on Step 2...");
    const clickedStep2Continue = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.button-cyan, .tap-effect, .cred-btn-black, .cred-btn-white'));
      const btn = btns.find(b => b.textContent.toUpperCase().includes('CONTINUE'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!clickedStep2Continue) {
      throw new Error("Could not find Step 2 Continue button!");
    }
    console.log("✅ Navigated to Step 3.");

    await new Promise(resolve => setTimeout(resolve, 1500));

    // 5. Step 3: Click "Post Job"
    console.log("🚀 Clicking Post Job...");
    const clickedPost = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.button-cyan, .tap-effect, .cred-btn-black, .cred-btn-white'));
      const btn = btns.find(b => b.textContent.toUpperCase().includes('POST JOB') || b.textContent.toUpperCase().includes('POST URGENT') || b.textContent.toUpperCase().includes('POST GIG'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!clickedPost) {
      throw new Error("Could not find Post Job button on Step 3!");
    }
    console.log("✅ Clicked Post Job.");

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take screenshot for step1_posted.png
    await page.screenshot({ path: path.join(projectRoot, 'step1_posted.png') });
    console.log("📸 Screenshot saved: step1_posted.png");

    // Fetch the created Job ID from localStorage
    const jobsList = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('genie_mock_jobs') || '[]');
    });
    console.log("Mock jobs in localStorage:", JSON.stringify(jobsList, null, 2));

    const loaderJob = [...jobsList].reverse().find(j => j.title === 'Warehouse Loader' || j.title === 'WAREHOUSE LOADER' || j.title?.toLowerCase().includes('warehouse loader'));
    const jobId = loaderJob ? loaderJob.id : null;

    if (!jobId) {
      throw new Error("Failed to find created Job ID in localStorage!");
    }
    console.log(`📌 Created Job ID: ${jobId}`);

    // 6. Switch role to Worker and Apply
    console.log("🔄 Switching role to worker...");
    const navPromise2 = page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    await page.evaluate(() => {
      localStorage.setItem('GENIE_ROLE', 'worker');
      location.reload();
    });
    await navPromise2;
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Go to Find Job tab
    console.log("🔍 Navigating to Find Job tab...");
    const clickedFindJob = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.nav-item'));
      const findJob = tabs.find(el => {
        const label = el.querySelector('.nav-item-label')?.textContent || '';
        const icon = el.querySelector('.nav-item-icon')?.textContent || '';
        return icon === '🔍' || label.toLowerCase().includes('jobs') || label.toLowerCase().includes('find job');
      });
      if (findJob) {
        findJob.click();
        return true;
      }
      return false;
    });

    if (!clickedFindJob) {
      throw new Error("Could not find Find Job tab in bottom navbar!");
    }
    console.log("✅ Switched to Find Job tab.");

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Click VIEW MISSION
    console.log(`👁️ Clicking VIEW MISSION on the new gig (Job ID: ${jobId})...`);
    const clickedViewMission = await page.evaluate((jobId) => {
      const cards = Array.from(document.querySelectorAll('.glass-premium, .cred-bill-row, .cred-card'));
      const targetSuffix = '#' + jobId.slice(-4).toUpperCase();
      const jobCard = cards.find(card => card.textContent.toUpperCase().includes(targetSuffix));
      if (jobCard) {
        const btn = Array.from(jobCard.querySelectorAll('.tap-effect, .cred-btn-black')).find(el => el.textContent.toUpperCase().includes('VIEW MISSION') || el.textContent.toUpperCase().includes('VIEW DETAILS') || el.textContent.toUpperCase().includes('₹') || el.textContent.toUpperCase().includes('APPLIED'));
        if (btn) {
          btn.click();
          return true;
        }
      }
      // Fallback
      const fallbackCard = cards.find(card => card.textContent.toUpperCase().includes('WAREHOUSE LOADER'));
      if (fallbackCard) {
        const btn = Array.from(fallbackCard.querySelectorAll('.tap-effect, .cred-btn-black')).find(el => el.textContent.toUpperCase().includes('VIEW MISSION') || el.textContent.toUpperCase().includes('VIEW DETAILS') || el.textContent.toUpperCase().includes('₹') || el.textContent.toUpperCase().includes('APPLIED'));
        if (btn) {
          btn.click();
          return true;
        }
      }
      return false;
    }, jobId);

    if (!clickedViewMission) {
      // Dump text content of body to diagnose
      const bodyText = await page.evaluate(() => document.body.innerText);
      console.log("=== Page Body Text on Failure ===");
      console.log(bodyText.substring(0, 1500));
      console.log("================================");
      await page.screenshot({ path: path.join(projectRoot, 'debug_view_mission.png') });
      console.log("📸 Saved debug_view_mission.png");
      throw new Error("Could not find VIEW MISSION button!");
    }
    console.log("✅ Opened Job Details.");

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Click INITIALIZE ENROLLMENT
    console.log("📝 Clicking INITIALIZE ENROLLMENT...");
    const clickedEnroll = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.tap-effect, .button-cyan, .cred-btn-black, .cred-btn-white'));
      const btn = items.find(el => el.textContent.toUpperCase().includes('INITIALIZE ENROLLMENT') || el.textContent.toUpperCase().includes('ENROLL'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!clickedEnroll) {
      throw new Error("Could not find INITIALIZE ENROLLMENT button!");
    }
    console.log("✅ Applied to Job successfully.");

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take screenshot for step2_applied.png
    await page.screenshot({ path: path.join(projectRoot, 'step2_applied.png') });
    console.log("📸 Screenshot saved: step2_applied.png");

    // 7. Switch role to Admin and Approve
    console.log("🔄 Switching role to admin to approve candidate...");
    const navPromise3 = page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    await page.evaluate(() => {
      localStorage.setItem('GENIE_ROLE', 'admin');
      location.reload();
    });
    await navPromise3;
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Find Approve button on the pending applications list
    console.log("👍 Approving worker application...");
    const clickedApprove = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button.button-cyan, .button-cyan, button.cred-btn-black, .cred-btn-black'));
      const btn = btns.find(b => b.textContent.toUpperCase().includes('APPROVE') || b.textContent.toUpperCase().includes('AUTHORIZE_ENTRY') || b.textContent.toUpperCase().includes('ENTRY'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!clickedApprove) {
      throw new Error("Could not find Approve button on Pending applications list!");
    }
    console.log("✅ Worker application approved.");

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take screenshot for step3_approved.png
    await page.screenshot({ path: path.join(projectRoot, 'step3_approved.png') });
    console.log("📸 Screenshot saved: step3_approved.png");

    // 8. Switch role to Worker and Check-In
    console.log("🔄 Switching role to worker for check-in...");
    const navPromise4 = page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    await page.evaluate(() => {
      localStorage.setItem('GENIE_ROLE', 'worker');
      location.reload();
    });
    await navPromise4;
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Navigate to Attendance screen directly using E2E navigateTo hook
    console.log(`⏱️ Navigating directly to Attendance screen for Job ID ${jobId}...`);
    await page.evaluate((jobId) => {
      window.navigateTo('Attendance', { jobId });
    }, jobId);

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Capture selfie (click the photo box)
    console.log("📸 Clicking camera box to capture proof selfie...");
    const clickedPhoto = await page.evaluate(() => {
      const photoBox = Array.from(document.querySelectorAll('.tap-effect')).find(el => el.textContent.includes('📸') || el.textContent.toUpperCase().includes('BIOMETRIC_CAPTURE') || el.style.width === '84px' || (el.style.width && el.style.width.includes('84')));
      if (photoBox) {
        photoBox.click();
        return true;
      }
      return false;
    });

    if (!clickedPhoto) {
      throw new Error("Could not find camera box!");
    }
    console.log("✅ Photo captured.");

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Click Check In button
    console.log("▶️ Clicking Check In...");
    const clickedCheckIn = await page.evaluate(() => {
      const btn = document.querySelector('.tap-effect.neon-pulse, button.cred-btn-black, .cred-btn-black');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!clickedCheckIn) {
      throw new Error("Could not find Check In button!");
    }
    console.log("✅ Check In button clicked.");

    // Wait for liveness, quality analysis, biometric scan simulation to finish (approx 6 seconds)
    console.log("⏳ Waiting for check-in biometric simulation...");
    await new Promise(resolve => setTimeout(resolve, 7000));

    // Take screenshot for step4_checked_in.png
    await page.screenshot({ path: path.join(projectRoot, 'step4_checked_in.png') });
    console.log("📸 Screenshot saved: step4_checked_in.png");

    // 9. Worker Check-Out (on the same Attendance screen)
    // Capture selfie again
    console.log("📸 Clicking camera box to capture check-out proof selfie...");
    const clickedPhoto2 = await page.evaluate(() => {
      const photoBox = Array.from(document.querySelectorAll('.tap-effect')).find(el => el.textContent.includes('📸') || el.textContent.toUpperCase().includes('BIOMETRIC_CAPTURE') || el.style.width === '84px' || (el.style.width && el.style.width.includes('84')));
      if (photoBox) {
        photoBox.click();
        return true;
      }
      return false;
    });

    if (!clickedPhoto2) {
      throw new Error("Could not find camera box for check-out!");
    }
    console.log("✅ Photo captured.");

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Click Check Out button
    console.log("⏹️ Clicking Check Out...");
    const clickedCheckOut = await page.evaluate(() => {
      const btn = document.querySelector('.tap-effect.neon-pulse, button.cred-btn-black, .cred-btn-black');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!clickedCheckOut) {
      throw new Error("Could not find Check Out button!");
    }
    console.log("✅ Check Out button clicked.");

    // Wait for biometric simulation to finish (approx 6 seconds)
    console.log("⏳ Waiting for check-out biometric simulation...");
    await new Promise(resolve => setTimeout(resolve, 7000));

    // Take screenshot for step5_checked_out.png
    await page.screenshot({ path: path.join(projectRoot, 'step5_checked_out.png') });
    console.log("📸 Screenshot saved: step5_checked_out.png");

    // 10. Switch role to Admin, click Active pipeline tab, click Done on our warehouse loader job, click Completed tab, click UPI
    console.log("🔄 Switching role to admin to complete application and settle payments...");
    const navPromise5 = page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    await page.evaluate(() => {
      localStorage.setItem('GENIE_ROLE', 'admin');
      location.reload();
    });
    await navPromise5;
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Log the current applications in localStorage
    const currentApps = await page.evaluate(() => {
      return localStorage.getItem('genie_mock_applications');
    });
    console.log("Mock applications in localStorage:", currentApps);

    // Select Active pipeline tab
    console.log("📊 Switching to Active pipeline tab...");
    const clickedActiveTab = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.clay-card bdi, .clay-card div, .cred-tab-bar bdi, .cred-tab'));
      const tab = tabs.find(el => el.textContent.toUpperCase().includes('ACTIVE'));
      if (tab) {
        tab.click();
        return true;
      }
      // Fallback
      const outer = document.querySelector('.clay-card[style*="padding: 6px"], .cred-tab-bar');
      if (outer && outer.children.length === 3) {
        outer.children[1].click();
        return true;
      }
      return false;
    });

    if (!clickedActiveTab) {
      throw new Error("Could not find Active pipeline tab button!");
    }
    console.log("✅ Selected Active tab.");

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Click "Done" on the Warehouse Loader application card
    console.log("✔️ Completing the Warehouse Loader application...");
    const clickedDone = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.clay-card, .cred-card'));
      const loaderCard = cards.find(card => {
        const text = card.textContent.toLowerCase();
        return text.includes('warehouse') && (text.includes('done') || text.includes('complete'));
      });
      if (loaderCard) {
        const doneBtn = Array.from(loaderCard.querySelectorAll('button')).find(b => b.textContent.toUpperCase().includes('DONE') || b.textContent.toUpperCase().includes('COMPLETE'));
        if (doneBtn) {
          doneBtn.click();
          return true;
        }
      }
      // Fallback
      const anyDoneBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.toUpperCase().includes('DONE') || b.textContent.toUpperCase().includes('COMPLETE'));
      if (anyDoneBtn) {
        anyDoneBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedDone) {
      throw new Error("Could not find Done button on Active tab!");
    }
    console.log("✅ Application completed.");

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Select Completed pipeline tab
    console.log("📊 Switching to Completed pipeline tab...");
    const clickedCompletedTab = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.clay-card bdi, .clay-card div, .cred-tab-bar bdi, .cred-tab'));
      const tab = tabs.find(el => el.textContent.toUpperCase().includes('COMPLETED'));
      if (tab) {
        tab.click();
        return true;
      }
      // Fallback
      const outer = document.querySelector('.clay-card[style*="padding: 6px"], .cred-tab-bar');
      if (outer && outer.children.length === 3) {
        outer.children[2].click();
        return true;
      }
      return false;
    });

    if (!clickedCompletedTab) {
      throw new Error("Could not find Completed pipeline tab button!");
    }
    console.log("✅ Selected Completed tab.");

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Find UPI button for Warehouse Loader and click it
    console.log("💸 Clicking UPI to trigger payment settlement for Warehouse Loader...");
    const clickedUpi = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.clay-card, .cred-card'));
      const loaderCard = cards.find(card => {
        const text = card.textContent.toLowerCase();
        return text.includes('warehouse') && (text.includes('upi') || text.includes('settle'));
      });
      if (loaderCard) {
        const upiBtn = Array.from(loaderCard.querySelectorAll('button, div, span')).find(el => el.textContent.toUpperCase().includes('UPI'));
        if (upiBtn) {
          upiBtn.click();
          return true;
        }
      }
      // Fallback
      const anyUpiBtn = Array.from(document.querySelectorAll('button, div, span')).find(el => el.textContent.toUpperCase().includes('UPI'));
      if (anyUpiBtn) {
        anyUpiBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedUpi) {
      throw new Error("Could not find UPI button on Completed list!");
    }
    console.log("✅ UPI settlement initiated.");

    // Wait for PDF generation and download to finish (approx 4 seconds)
    console.log("⏳ Waiting for payslip PDF generation and download...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Take screenshot for step6_settled.png
    await page.screenshot({ path: path.join(projectRoot, 'step6_settled.png') });
    console.log("📸 Screenshot saved: step6_settled.png");

    // Check if the PaySlip PDF exists in the directory
    const files = fs.readdirSync(projectRoot);
    const payslipPdf = files.find(f => f.startsWith('PaySlip_') && f.endsWith('.pdf'));

    if (payslipPdf) {
      console.log(`🎉 SUCCESS: Payslip PDF generated and downloaded: ${payslipPdf}`);
    } else {
      console.error("⚠️ WARNING: Payslip PDF was not found in download path!");
    }

    console.log("\n✨ ===================================================");
    console.log("🎉 ALL E2E LIFECYCLE STAGES COMPLETED SUCCESSFULLY!");
    console.log("===================================================\n");

  } catch (err) {
    console.error("❌ E2E lifecycle test error:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
