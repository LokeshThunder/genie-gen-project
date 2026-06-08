import puppeteer from 'puppeteer';
import fs from 'fs';

async function run() {
  console.log("🚀 Launching Puppeteer E2E test for Worker role...");
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

    console.log("🔗 Navigating to http://localhost:5173/ and setting role to worker...");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    
    // Set localStorage to worker and reload
    await page.evaluate(() => {
      localStorage.setItem('GENIE_ROLE', 'worker');
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Now we are logged in as worker. Let's go to Profile screen.
    console.log("👤 Navigating to Worker Profile page...");
    const profileBtn = await page.evaluateHandle(() => {
      const items = Array.from(document.querySelectorAll('.nav-item'));
      return items.find(el => {
        const text = el.textContent.toUpperCase();
        return text.includes('PROFILE') || text.includes('MORE') || text.includes('சுயவிவரம்') || text.includes('പ്രൊഫൈൽ') || text.includes('⋯');
      });
    });
    
    if (profileBtn) {
      await page.evaluate(el => el.click(), profileBtn);
      console.log("✅ Clicked Profile tab.");
    } else {
      await page.screenshot({ path: 'worker_home_error.png' });
      throw new Error("Could not find Profile tab for worker!");
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Open language picker
    console.log("🌐 Clicking App Language settings row...");
    const langRow = await page.evaluateHandle(() => {
      const rows = Array.from(document.querySelectorAll('.tap-effect'));
      return rows.find(el => el.textContent.includes('App Language') || el.textContent.includes('🌐') || el.textContent.includes('பயன்பாட்டு மொழி') || el.textContent.includes('ഭാഷ'));
    });

    if (langRow) {
      await page.evaluate(el => el.click(), langRow);
      console.log("✅ Clicked App Language row.");
    } else {
      await page.screenshot({ path: 'profile_screen_error.png' });
      throw new Error("Could not find App Language row!");
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Select Tamil
    console.log("🇮🇳 Selecting Tamil...");
    const tamilCard = await page.evaluateHandle(() => {
      const cards = Array.from(document.querySelectorAll('.clay-card'));
      return cards.find(el => el.textContent.includes('Tamil'));
    });

    if (tamilCard) {
      await page.evaluate(el => el.click(), tamilCard);
      console.log("✅ Selected Tamil.");
    } else {
      await page.screenshot({ path: 'modal_error.png' });
      throw new Error("Could not find Tamil card in modal!");
    }

    await new Promise(resolve => setTimeout(resolve, 2500));

    // Print navbar items in Tamil
    let navBarContent = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.nav-item'));
      return items.map(el => el.innerText.trim().replace(/\n/g, ' '));
    });
    console.log("Bottom Navbar items in Tamil:", navBarContent);

    // Save screenshot
    const tamilProfilePath = 'C:/Users/my pc/.gemini/antigravity/scratch/job_genie_react/tamil_worker_profile.png';
    await page.screenshot({ path: tamilProfilePath });
    console.log(`📸 Screenshot saved to ${tamilProfilePath}`);

    // Open language picker again to test Malayalam
    console.log("🌐 Re-opening language selector...");
    const langRow2 = await page.evaluateHandle(() => {
      const rows = Array.from(document.querySelectorAll('.tap-effect'));
      return rows.find(el => el.textContent.includes('App Language') || el.textContent.includes('🌐') || el.textContent.includes('பயன்பாட்டு மொழி') || el.textContent.includes('ഭാഷ'));
    });

    if (langRow2) {
      await page.evaluate(el => el.click(), langRow2);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      throw new Error("Could not re-find App Language row!");
    }

    // Select Malayalam
    console.log("🇮🇳 Selecting Malayalam...");
    const malayalamCard = await page.evaluateHandle(() => {
      const cards = Array.from(document.querySelectorAll('.clay-card'));
      return cards.find(el => el.textContent.includes('Malayalam'));
    });

    if (malayalamCard) {
      await page.evaluate(el => el.click(), malayalamCard);
      console.log("✅ Selected Malayalam.");
    } else {
      throw new Error("Could not find Malayalam card!");
    }

    await new Promise(resolve => setTimeout(resolve, 2500));

    // Print navbar items in Malayalam
    navBarContent = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.nav-item'));
      return items.map(el => el.innerText.trim().replace(/\n/g, ' '));
    });
    console.log("Bottom Navbar items in Malayalam:", navBarContent);

    // Save screenshot
    const malayalamProfilePath = 'C:/Users/my pc/.gemini/antigravity/scratch/job_genie_react/malayalam_worker_profile.png';
    await page.screenshot({ path: malayalamProfilePath });
    console.log(`📸 Screenshot saved to ${malayalamProfilePath}`);

    // Restore GENIE_ROLE to admin so the app behavior defaults back to admin
    await page.evaluate(() => {
      localStorage.setItem('GENIE_ROLE', 'admin');
    });

  } catch (err) {
    console.error("❌ E2E Test Error:", err);
  } finally {
    await browser.close();
  }
}

run();
