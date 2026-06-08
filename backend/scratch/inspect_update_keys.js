import fs from 'fs';

const content = fs.readFileSync('./update_keys.js', 'utf-8');
const match = content.match(/const newKeys = {([\s\S]*?)};\r?\n\r?\nconst languages/);
if (match) {
  const keysStr = '{' + match[1] + '}';
  const newKeysObj = new Function(`return ${keysStr}`)();
  const targetKeys = [
    'early_bird', 'reliability_pro', 'fast_learner', 'team_player', 'night_owl',
    'workforce_analytics', 'total_payment_summary', 'total_paid', 'platform_fee', 'net_to_workers',
    'settled_transaction', 'settled_transactions', 'completions', 'absentee_rate', 'top_workers',
    'verified_operator', 'rating_label', 'rank_label', 'trust_label', 'details_label', 'tap_to_flip_front'
  ];
  
  targetKeys.forEach(k => {
    if (newKeysObj[k]) {
      console.log(`Found existing key in update_keys.js: ${k}`);
    } else {
      console.log(`Key NOT found in update_keys.js: ${k}`);
    }
  });
} else {
  console.log("Could not find newKeys object in update_keys.js");
}
