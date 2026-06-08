import puppeteer from 'puppeteer';

async function measureLogin() {
  console.log("🚀 Launching browser to measure login time...");
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });

  try {
    console.log("🔗 Loading app...");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    
    // Ensure we are in worker role and reset storage
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('GENIE_ROLE', 'worker');
    });
    
    // Let the app initialize LoginScreen
    await page.waitForFunction('!!window.__triggerLoginBypass');
    
    console.log("⏳ Triggering worker login...");
    
    // Measure time
    const startTime = Date.now();
    
    await page.evaluate(async () => {
      await window.__triggerLoginBypass();
    });
    
    // Wait for the cyber-hud-overlay which implies the Home screen or main app layout is rendered
    await page.waitForSelector('.cyber-hud-overlay', { timeout: 10000 });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Worker logged in successfully!`);
    console.log(`⏱️  Total time taken to log in and render dashboard: ${duration} ms`);

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await browser.close();
  }
}

measureLogin();
