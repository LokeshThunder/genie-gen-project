import { TRANSLATIONS } from '../src/constants/translations.js';

const keys = [
  'profile_title',
  'manage_account',
  'dob',
  'gender',
  'experience',
  'preferred_areas',
  'profile_strength',
  'verified_credentials',
  'achievements_label',
  'early_bird',
  'reliability_pro',
  'fast_learner',
  'team_player',
  'night_owl',
  'workforce_analytics',
  'total_payment_summary',
  'total_paid',
  'platform_fee',
  'net_to_workers',
  'settled_transaction',
  'settled_transactions',
  'completions',
  'absentee_rate',
  'top_workers',
  'export',
  'verified_operator',
  'rating_label',
  'rank_label',
  'trust_label',
  'details_label',
  'tap_to_flip_front',
  'settings_label',
  'dark_mode',
  'app_language',
  'privacy_safety',
  'logout',
  'select_language',
  'jobs_label',
  'genie_ai'
];

['Tamil', 'Malayalam'].forEach(lang => {
  console.log(lang + ':');
  keys.forEach(k => {
    console.log('  ' + k + ': ' + TRANSLATIONS[lang][k]);
  });
});
