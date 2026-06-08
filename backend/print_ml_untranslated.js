import { TRANSLATIONS } from './src/constants/translations.js';

const english = TRANSLATIONS.English;
const malayalam = TRANSLATIONS.Malayalam;

const untranslated = [];
Object.keys(english).forEach(key => {
  const val = english[key];
  const mlVal = malayalam[key];
  const isTech = /^[A-Z0-9\s_\-\.\:\/\\⚡📍🕒📅📊👤✨🔍✉️📞➔✎↗⏰]+$/.test(val) && val.length <= 8;
  const isShortWord = val.length <= 3 && /^[A-Za-z]+$/.test(val);
  
  if (val === mlVal && !isTech && !isShortWord && /[a-zA-Z]/.test(val)) {
    untranslated.push({ key, val });
  }
});

console.log(JSON.stringify(untranslated, null, 2));
