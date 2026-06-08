import puppeteer from 'puppeteer';
import fs from 'fs';

async function run() {
  console.log("🚀 Launching Puppeteer E2E test with scroll support...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.setCacheEnabled(false);

    // Inject E2E test flag on load
    await page.evaluateOnNewDocument(() => {
      window.IS_E2E_TEST = true;
    });

    console.log("🔗 Navigating to http://localhost:5173/ ...");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    
    // Wait for the app to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("👤 Navigating to Profile page...");
    const profileBtn = await page.evaluateHandle(() => {
      const items = Array.from(document.querySelectorAll('.nav-item'));
      return items.find(el => el.textContent.includes('PROFILE') || el.textContent.includes('👤'));
    });
    
    if (profileBtn) {
      await page.evaluate(el => el.click(), profileBtn);
      console.log("✅ Clicked Profile tab.");
    } else {
      throw new Error("Could not find Profile tab in bottom navbar!");
    }

    // Wait for profile screen to render
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log("🌐 Clicking App Language settings row...");
    const langRow = await page.evaluateHandle(() => {
      const rows = Array.from(document.querySelectorAll('.tap-effect'));
      return rows.find(el => el.textContent.includes('App Language') || el.textContent.includes('🌐'));
    });

    if (langRow) {
      await page.evaluate(el => el.click(), langRow);
      console.log("✅ Clicked App Language row.");
    } else {
      throw new Error("Could not find App Language row!");
    }

    // Wait for language picker modal
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log("🇮🇳 Finding 'Malayalam' from the language modal...");
    // Let's get the Malayalam card element handle
    const malayalamCard = await page.evaluateHandle(() => {
      const cards = Array.from(document.querySelectorAll('.clay-card'));
      return cards.find(el => el.textContent.includes('Malayalam'));
    });

    if (malayalamCard) {
      // Click the element directly
      await page.evaluate(el => el.click(), malayalamCard);
      console.log("✅ Clicked Malayalam language card.");
    } else {
      throw new Error("Could not find Malayalam card in modal!");
    }

    // Wait for translation state to update and modal to close
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Capture navbar items and verify
    const navBarContent = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.nav-item'));
      return items.map(el => el.innerText.trim().replace(/\n/g, ' '));
    });

    console.log("Bottom Navbar items in Malayalam:", navBarContent);

    const containsMalayalamReports = navBarContent.some(item => item.includes('റിപ്പോർട്ടുകൾ'));
    const containsEnglishReports = navBarContent.some(item => item.toLowerCase().includes('reports'));

    if (containsMalayalamReports) {
      console.log("🎉 SUCCESS: Bottom navbar 'reports' key successfully localized to 'റിപ്പോർട്ടുകൾ'!");
    } else if (containsEnglishReports) {
      console.log("❌ FAILURE: Bottom navbar still shows English 'reports'!");
    } else {
      console.log("⚠️ WARNING: Neither 'റിപ്പോർട്ടുകൾ' nor 'reports' detected in navbar items. Found items:", navBarContent);
    }

    // Save screenshot of Malayalam Profile screen
    const profileScreenshotPath = 'C:/Users/my pc/.gemini/antigravity/scratch/job_genie_react/malayalam_profile.png';
    await page.screenshot({ path: profileScreenshotPath });
    console.log(`📸 Screenshot saved to ${profileScreenshotPath}`);

    // Now go back to Home screen and take another screenshot to verify home screen is translated
    console.log("🏠 Going back to Home screen...");
    const homeBtn = await page.evaluateHandle(() => {
      const items = Array.from(document.querySelectorAll('.nav-item'));
      return items.find(el => el.textContent.includes('ഹോം') || el.textContent.includes('🏠') || el.textContent.includes('HOME'));
    });

    if (homeBtn) {
      await page.evaluate(el => el.click(), homeBtn);
      console.log("✅ Clicked Home tab.");
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    const homeScreenshotPath = 'C:/Users/my pc/.gemini/antigravity/scratch/job_genie_react/malayalam_home.png';
    await page.screenshot({ path: homeScreenshotPath });
    console.log(`📸 Home screen screenshot saved to ${homeScreenshotPath}`);

    const homeElements = await page.evaluate(() => {
      const el = document.querySelector('.tech-header');
      return el ? el.textContent : null;
    });
    console.log("Home Page Main Header Text:", homeElements);

  } catch (err) {
    console.error("❌ E2E Test Error:", err);
  } finally {
    await browser.close();
  }
}

run();
