import { TRANSLATIONS } from './src/constants/translations.js';

['English', 'Malayalam'].forEach(lang => {
  console.log(`\n=== ${lang} ===`);
  ['home', 'active_label', 'reports', 'profile'].forEach(key => {
    console.log(`${key} -> "${TRANSLATIONS[lang][key]}"`);
  });
});
