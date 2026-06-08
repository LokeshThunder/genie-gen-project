import puppeteer from 'puppeteer';
import fs from 'fs';

async function run() {
  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    
    console.log("Navigating to http://localhost:5173/ ...");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    
    // Wait for the app to mount
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("Dumping elements...");
    const data = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, a, [role="button"], h1, h2, h3, div')).map(el => {
        const text = (el.innerText || el.textContent || '').trim().replace(/\n/g, ' ');
        if (!text || text.length > 100) return null;
        return {
          tag: el.tagName,
          text: text,
          id: el.id || '',
          className: el.className || ''
        };
      }).filter(Boolean);
      return {
        url: window.location.href,
        title: document.title,
        elements: elements.slice(0, 100)
      };
    });

    console.log("URL:", data.url);
    console.log("Title:", data.title);
    console.log("Elements found (first 100):");
    data.elements.forEach((el, index) => {
      console.log(`[${index}] ${el.tag} (id="${el.id}", class="${el.className}"): "${el.text}"`);
    });

    await page.screenshot({ path: 'C:/Users/my pc/.gemini/antigravity/scratch/job_genie_react/initial_page.png' });
    console.log("Screenshot saved to initial_page.png");
  } catch (err) {
    console.error("Error during dump:", err);
  } finally {
    await browser.close();
  }
}

run();
