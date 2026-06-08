import puppeteer from 'puppeteer';

async function run() {
  console.log("🚀 Launching Puppeteer E2E test for Worker Home Localization...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });

    // Inject E2E test flag on load
    await page.evaluateOnNewDocument(() => {
      window.IS_E2E_TEST = true;
    });

    console.log("🔗 Setting local storage for Worker and Malayalam...");
    // We can go to page first and set storage
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    
    await page.evaluate(() => {
      localStorage.setItem('GENIE_ROLE', 'worker');
      localStorage.setItem('GENIE_LANG', 'Malayalam');
    });
    
    console.log("🔄 Reloading to apply Malayalam translation...");
    await page.reload({ waitUntil: 'networkidle2' });
    
    // Wait for skeleton loader to dismiss (max 5s, but usually faster)
    console.log("⏳ Waiting for home screen to load...");
    await new Promise(resolve => setTimeout(resolve, 3500));

    // Capture screenshot of localized home screen
    const screenshotPath = 'malayalam_home.png';
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Localized Home Screen screenshot saved to ${screenshotPath}`);

    // Restore GENIE_ROLE and GENIE_LANG
    await page.evaluate(() => {
      localStorage.setItem('GENIE_ROLE', 'admin');
      localStorage.setItem('GENIE_LANG', 'English');
    });

  } catch (err) {
    console.error("❌ E2E Test Error:", err);
  } finally {
    await browser.close();
  }
}

run();
