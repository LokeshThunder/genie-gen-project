import puppeteer from 'puppeteer';
import path from 'path';

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 430, height: 900 });
    
    // Listen for console logs
    page.on('console', msg => console.log('BROWSER:', msg.text()));

    console.log("Navigating to app...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    console.log("Waiting for app to render...");
    await page.waitForTimeout(2000);

    // Evaluate layout
    const layout = await page.evaluate(() => {
      const getRect = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          id: el.id || el.className,
          top: rect.top,
          height: rect.height,
          bg: window.getComputedStyle(el).backgroundColor,
          paddingTop: window.getComputedStyle(el).paddingTop,
          marginTop: window.getComputedStyle(el).marginTop
        };
      };

      return {
        mobileContainer: getRect('.mobile-container'),
        fullHeightScroll: getRect('.full-height-scroll'),
        holographicPassContainer: getRect('.full-height-scroll > div'),
        holographicPass: getRect('.full-height-scroll > div > div'),
        headerPadVar: getComputedStyle(document.documentElement).getPropertyValue('--header-pad')
      };
    });

    console.log("Layout details:", JSON.stringify(layout, null, 2));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await browser.close();
  }
}

run();
