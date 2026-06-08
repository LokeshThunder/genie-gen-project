import { aiService } from '../src/services/aiService.js';
import { TRANSLATIONS } from '../src/constants/translations.js';

async function testFallback(lang) {
  console.log(`\n--- Testing Fallback for [${lang}] ---`);
  
  const userContext = {
    role: 'worker',
    xp: 750,
    name: 'Test Partner'
  };

  // Test Job Search query fallback
  const jobRes = await aiService.chat("find job in madipakkam", [], false, userContext, lang);
  console.log("Job Search Response:", jobRes);
  if (jobRes.type !== 'navigation' || jobRes.screen !== 'Find Job') {
    throw new Error(`[${lang}] Job fallback failed: ${JSON.stringify(jobRes)}`);
  }

  // Test Earnings query fallback
  const earnRes = await aiService.chat("check my pay", [], false, userContext, lang);
  console.log("Earnings Response:", earnRes);
  if (earnRes.type !== 'navigation' || earnRes.screen !== 'Earnings') {
    throw new Error(`[${lang}] Earnings fallback failed: ${JSON.stringify(earnRes)}`);
  }

  // Test Status query fallback
  const statusRes = await aiService.chat("who am i", [], false, userContext, lang);
  console.log("Status Response:", statusRes);
  if (statusRes.type !== 'text') {
    throw new Error(`[${lang}] Status fallback failed: ${JSON.stringify(statusRes)}`);
  }

  // Test Help query fallback
  const helpRes = await aiService.chat("need help please", [], false, userContext, lang);
  console.log("Help Response:", helpRes);
  if (helpRes.type !== 'text') {
    throw new Error(`[${lang}] Help fallback failed: ${JSON.stringify(helpRes)}`);
  }

  // Test Default fallback
  const defaultRes = await aiService.chat("hello, tell me a joke", [], false, userContext, lang);
  console.log("Default Response:", defaultRes);
  if (defaultRes.type !== 'text') {
    throw new Error(`[${lang}] Default fallback failed: ${JSON.stringify(defaultRes)}`);
  }

  console.log(`[${lang}] Fallback tests passed successfully!`);
}

async function runAll() {
  try {
    await testFallback('English');
    await testFallback('Tamil');
    await testFallback('Malayalam');
    await testFallback('Hindi');
    console.log("\nALL TEST FALLBACKS PASSED!");
  } catch (err) {
    console.error("\nTEST FAILED:", err);
    process.exit(1);
  }
}

runAll();
