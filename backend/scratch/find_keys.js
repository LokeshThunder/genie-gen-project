import { TRANSLATIONS } from '../src/constants/translations.js';

const searchTerms = ['shift', 'progress', 'view', 'check', 'start', 'ready'];
const results = {};

searchTerms.forEach(term => {
  results[term] = [];
});

Object.entries(TRANSLATIONS.English).forEach(([key, val]) => {
  searchTerms.forEach(term => {
    if (key.toLowerCase().includes(term) || val.toLowerCase().includes(term)) {
      results[term].push({ key, val });
    }
  });
});

console.log(JSON.stringify(results, null, 2));
