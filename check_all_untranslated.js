import { TRANSLATIONS } from './src/constants/translations.js';

const languages = Object.keys(TRANSLATIONS).filter(lang => lang !== 'English');
const english = TRANSLATIONS.English;

languages.forEach(lang => {
  const untranslated = [];
  Object.keys(english).forEach(key => {
    // If the English value has letters (not just symbols or numbers or empty)
    // and the translated value is exactly the same as the English value,
    // and the English value is not a technical term that shouldn't be translated (like ID, XP, GPS, AI, SMS, OK, SOS, AADHAAR, PAN, VS, HTML, PDF)
    const val = english[key];
    const isTech = /^[A-Z0-9\s_\-\.\:\/\\⚡📍🕒📅📊👤✨🔍✉️📞➔✎↗⏰]+$/.test(val) && val.length <= 8;
    const isShortWord = val.length <= 3 && /^[A-Za-z]+$/.test(val);
    
    if (val === TRANSLATIONS[lang][key] && !isTech && !isShortWord && /[a-zA-Z]/.test(val)) {
      untranslated.push({ key, val });
    }
  });
  console.log(`${lang} has ${untranslated.length} untranslated keys.`);
  if (untranslated.length > 0) {
    console.log(`  Sample keys: ${untranslated.slice(0, 10).map(x => `${x.key} ("${x.val}")`).join(', ')}`);
  }
});
