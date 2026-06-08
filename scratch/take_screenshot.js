import puppeteer from 'puppeteer';
import path from 'path';

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    
    await page.evaluate(() => {
      localStorage.setItem('GENIE_ROLE', 'worker');
      localStorage.setItem('GENIE_LANG', 'English');
    });
    
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("Navigating to Profile tab...");
    await page.evaluate(() => {
      // Find navigation/navigation helper or call navigateTo
      if (typeof window.navigateTo === 'function') {
        window.navigateTo('Profile');
      } else {
        console.log("window.navigateTo is not available");
      }
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the HTML content to see if there is any strange elements
    const bodyHtml = await page.evaluate(() => document.body.innerHTML);
    console.log("Body HTML length:", bodyHtml.length);

    const screenshotPath = 'C:\\Users\\my pc\\.gemini\\antigravity-ide\\brain\\d49f61fb-bb91-4588-8798-d00b3641bab3\\profile_check.png';
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to ${screenshotPath}`);

  } catch (err) {
    console.error("Error taking screenshot:", err);
  } finally {
    await browser.close();
  }
}

run();
