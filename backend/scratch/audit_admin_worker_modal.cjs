const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:/Users/my pc/.gemini/antigravity-ide/brain/c0bc7d29-1cbe-45cc-af0e-7c5780d6ca9e/';

async function run() {
  console.log("🚀 Launching worker modal screenshot audit...");
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 1200, isMobile: true, hasTouch: true });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');

  try {
    await page.evaluateOnNewDocument(() => {
      window.IS_E2E_TEST = true;
    });

    console.log("🔗 Navigating to login page...");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    
    // Set admin role and dark theme (CRED)
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('GENIE_ROLE', 'admin');
      localStorage.setItem('GENIE_THEME', 'dark');
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000));

    // Scroll to the bottom
    console.log("📜 Scrolling down to find the Operational Pipeline...");
    await page.evaluate(() => {
      const scrollable = document.querySelector('.full-height-scroll');
      if (scrollable) {
        scrollable.scrollTop = scrollable.scrollHeight;
      } else {
        window.scrollTo(0, document.body.scrollHeight);
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    console.log("🖱️ Clicking on 'Active' pipeline tab...");
    const tabClicked = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.cred-tab'));
      const activeTab = tabs.find(t => t.textContent.trim() === 'Active' || t.textContent.trim().toLowerCase() === 'active');
      if (activeTab) {
        activeTab.click();
        return true;
      }
      return false;
    });
    console.log(`Tab clicked: ${tabClicked}`);
    await new Promise(r => setTimeout(r, 1500)); // wait for list animation

    console.log("🖱️ Searching for worker cards containing '👤'...");
    const clickedWorker = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.tap-effect.cred-card'));
      console.log(`Found ${cards.length} cards total after switching tabs.`);
      
      // Look for a card that has the avatar emoji "👤"
      const workerCard = cards.find(c => c.textContent.includes('👤'));

      if (workerCard) {
        workerCard.click();
        return true;
      }
      return false;
    });
    console.log(`Clicked worker card: ${clickedWorker}`);
    await new Promise(r => setTimeout(r, 2500)); // wait for modal transition

    console.log("📸 Capturing Admin Worker Detail Modal...");
    const screenshotPath = path.join(artifactDir, 'audit_admin_worker_modal.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved screenshot to: ${screenshotPath}`);

  } catch (err) {
    console.error("❌ Modal screenshot failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
