import { TRANSLATIONS } from './src/constants/translations.js';

const languages = Object.keys(TRANSLATIONS);
const masterKeys = Object.keys(TRANSLATIONS.English);

console.log(`Master Keys Count (English): ${masterKeys.length}`);

languages.forEach(lang => {
  const langKeys = Object.keys(TRANSLATIONS[lang]);
  const missing = masterKeys.filter(key => !langKeys.includes(key));
  const extra = langKeys.filter(key => !masterKeys.includes(key));
  
  if (missing.length > 0 || extra.length > 0) {
    console.log(`\n[${lang}] Status: INCOMPLETE`);
    if (missing.length > 0) console.log(`  Missing keys (${missing.length}): ${missing.join(', ')}`);
    if (extra.length > 0) console.log(`  Extra keys (${extra.length}): ${extra.join(', ')}`);
  } else {
    console.log(`[${lang}] Status: 100% COMPLETE (${langKeys.length} keys)`);
  }
});
