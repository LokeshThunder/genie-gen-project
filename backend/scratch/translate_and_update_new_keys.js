import fs from 'fs';

const languages = {
  Hindi: "hi",
  Bengali: "bn",
  Marathi: "mr",
  Telugu: "te",
  Tamil: "ta",
  Gujarati: "gu",
  Urdu: "ur",
  Kannada: "kn",
  Odia: "or",
  Malayalam: "ml"
};

const newKeysToTranslate = {
  early_bird: "Early Bird",
  reliability_pro: "Reliability Pro",
  fast_learner: "Fast Learner",
  team_player: "Team Player",
  night_owl: "Night Owl",
  workforce_analytics: "Workforce Analytics",
  total_payment_summary: "Total Payment Summary",
  total_paid: "Total Paid",
  platform_fee: "Platform Fee (10%)",
  net_to_workers: "Net to Workers",
  settled_transaction: "settled transaction",
  settled_transactions: "settled transactions",
  completions: "Completions",
  absentee_rate: "Absentee Rate",
  top_workers: "Top Workers",
  verified_operator: "VERIFIED OPERATOR",
  rating_label: "Rating",
  rank_label: "Rank",
  trust_label: "Trust",
  details_label: "DETAILS",
  tap_to_flip_front: "TAP TO FLIP FRONT",
  verified_credentials: "Verified Credentials"
};

async function translateSingle(text, langCode) {
  // Let's use google translate API
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0].trim();
    }
    return text;
  } catch (err) {
    console.error(`    Failed to translate "${text}" to code "${langCode}":`, err.message);
    return text; // fallback to English
  }
}

async function run() {
  console.log("Starting translation of new keys...");
  const translatedKeys = {};

  const keys = Object.keys(newKeysToTranslate);
  
  for (const key of keys) {
    const englishVal = newKeysToTranslate[key];
    console.log(`Translating "${key}" ("${englishVal}")...`);
    
    translatedKeys[key] = {
      English: englishVal
    };
    
    for (const [langName, langCode] of Object.entries(languages)) {
      const translated = await translateSingle(englishVal, langCode);
      translatedKeys[key][langName] = translated;
      // Small sleep to be nice to the API
      await new Promise(r => setTimeout(r, 80));
    }
    console.log(`  Done with "${key}".`);
  }

  console.log("Translations fetched successfully!");

  // Now, let's load update_keys.js and insert these keys.
  const updateKeysPath = './update_keys.js';
  let updateKeysContent = fs.readFileSync(updateKeysPath, 'utf-8');

  // Let's format the new keys block
  let newKeysBlock = '';
  Object.keys(translatedKeys).forEach(key => {
    newKeysBlock += `  ${key}: {\n`;
    Object.keys(translatedKeys[key]).forEach(lang => {
      // Escape double quotes if any
      const val = translatedKeys[key][lang].replace(/"/g, '\\"');
      newKeysBlock += `    ${lang}: "${val}",\n`;
    });
    // Remove last comma and newline for clean formatting
    newKeysBlock = newKeysBlock.slice(0, -2) + '\n  },\n';
  });

  // Remove the trailing comma from the last key to make it clean
  if (newKeysBlock.endsWith(',\n')) {
    newKeysBlock = newKeysBlock.slice(0, -2) + '\n';
  }

  // Find reports block in update_keys.js to append our new keys
  // It looks like:
  //   reports: {
  //     ...
  //     Malayalam: "റിപ്പോർട്ടുകൾ"
  //   }
  // };
  const reportsPattern = /(reports:\s*{[\s\S]*?Malayalam:\s*"റിപ്പോർട്ടുകൾ"\s*}\n\s*})/g;
  
  if (updateKeysContent.match(reportsPattern)) {
    console.log("Found reports key in update_keys.js. Appending new keys...");
    updateKeysContent = updateKeysContent.replace(reportsPattern, `$1,\n${newKeysBlock}`);
    fs.writeFileSync(updateKeysPath, updateKeysContent, 'utf-8');
    console.log("Successfully updated update_keys.js with new translated keys!");
  } else {
    console.error("Could not find the reports block in update_keys.js using the regex!");
  }
}

run();
