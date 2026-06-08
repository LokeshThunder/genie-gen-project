import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    
    // Listen to console logs in page
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    // Inject E2E flag
    await page.evaluateOnNewDocument(() => {
      window.IS_E2E_TEST = true;
    });

    console.log("Navigating to http://localhost:5173/ ...");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    
    // Check initial state
    const currentUrl = page.url();
    console.log("Current URL:", currentUrl);
    
    const roleBefore = await page.evaluate(() => localStorage.getItem('GENIE_ROLE'));
    const loggedInBefore = await page.evaluate(() => document.body.innerText.includes('Welcome Back') || document.body.innerText.includes('Home'));
    console.log("Initial role in localStorage:", roleBefore);
    console.log("Is Home page showing initially:", loggedInBefore);
    
    // Set to worker
    await page.evaluate(() => {
      localStorage.setItem('GENIE_ROLE', 'worker');
    });
    
    console.log("Reloading...");
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const roleAfter = await page.evaluate(() => localStorage.getItem('GENIE_ROLE'));
    console.log("Role after reload:", roleAfter);
    
    // Print all text in body to see what screen is showing
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log("=== BODY TEXT (length=" + bodyText.length + ") ===");
    console.log(bodyText.substring(0, 1000));
    
    // Find nav items
    const navItems = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.nav-item'));
      return items.map(el => el.textContent);
    });
    console.log("Nav items found:", navItems);

  } catch (err) {
    console.error("Error during debug:", err);
  } finally {
    await browser.close();
  }
}

run();
