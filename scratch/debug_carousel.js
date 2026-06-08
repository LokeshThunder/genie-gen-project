import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const artifactDir = 'C:/Users/my pc/.gemini/antigravity-ide/brain/c0bc7d29-1cbe-45cc-af0e-7c5780d6ca9e/';

async function run() {
  console.log("Launching system Chrome...");
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');

  // Capture console logs
  page.on('console', msg => {
    console.log('PAGE LOG:', msg.text());
  });

  page.on('pageerror', err => {
    console.error('PAGE ERROR:', err.message);
  });

  try {
    console.log("Navigating to app...");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Clear localStorage and set worker role first
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('GENIE_ROLE', 'admin');
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));

    // Click "Demo Login (Skip Auth)" button
    console.log("Clicking Demo Login...");
    const clicked = await page.evaluate(() => {
      const divs = Array.from(document.querySelectorAll('div'));
      const demoBtn = divs.find(el => el.textContent.includes('DEMO LOGIN') || el.textContent.includes('Demo Login') || el.textContent.includes('Skip Auth'));
      if (demoBtn) {
        demoBtn.click();
        return true;
      }
      return false;
    });

    console.log("Bypass clicked:", clicked);
    await new Promise(r => setTimeout(r, 4000)); // Wait for app to login and construct the dashboard

    console.log("Auditing Carousel state...");
    const state = await page.evaluate(() => {
      const navBar = document.querySelector('nav.bottom-nav');
      const activeTabEl = navBar ? navBar.querySelector('.nav-upi-label-text') : null;
      const activeTabLabel = activeTabEl ? activeTabEl.textContent.trim() : 'Unknown';

      // Find the carousel screen divs
      const screens = Array.from(document.querySelectorAll('div[style*="position: absolute"]'))
        .filter(el => el.style.left && el.style.width === '100%');
      
      const screensInfo = screens.map((el, i) => {
        // Find header text or content preview
        const header = el.querySelector('h1, h2, .tech-header, div[style*="font-size: 22px"], div[style*="font-size: 24px"]');
        return {
          index: i,
          left: el.style.left,
          headerText: header ? header.innerText.trim().replace(/\n/g, ' ') : 'None',
          visibleX: el.getBoundingClientRect().left
        };
      });

      // Get motion.div transform
      const motionDiv = document.querySelector('div[style*="touch-action: pan-y"]');
      const transform = motionDiv ? motionDiv.style.transform : 'None';

      return {
        activeTabLabel,
        transform,
        screensInfo
      };
    });

    console.log("RESULT STATE:", JSON.stringify(state, null, 2));

    const screenshotPath = path.join(artifactDir, 'debug_carousel.png');
    console.log("Taking screenshot...");
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved screenshot to: ${screenshotPath}`);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await browser.close();
  }
}

run();
