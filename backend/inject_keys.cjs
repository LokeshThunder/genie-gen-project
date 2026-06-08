const fs = require('fs');
const filePath = 'e:/genie gen/src/constants/translations.js';
let content = fs.readFileSync(filePath, 'utf8');

const newKeys = [
  'fill_required', 'post_failed', 'create_job_title', 'job_details_subtitle', 
  'title_label', 'placeholder_title', 'pricing_model', 'daily_wage', 'hourly_rate', 
  'pincode_label', 'placeholder_pincode', 'area_label', 'placeholder_area', 
  'workers_needed', 'date_label', 'start_time', 'end_time', 'extra_info', 
  'placeholder_desc', 'gender_pref', 'update_job', 'post_job', 'create_job', 
  'level_induction', 'level_core', 'level_elite', 'level_command', 
  'planner_title', 'planner_subtitle', 'monthly_goal', 'smart_forecast', 
  'estimate', 'near_future', 'confidence', 'confidence_high', 'best_days', 
  'day_mon', 'day_wed', 'day_sat', 'surge_multiplier', 'your_journey', 
  'reached', 'roadmap_success', 'target_amount', 'login_failed', 
  'otp_send_failed', 'otp_invalid', 'welcome_to', 'job_genie', 'login_subtitle', 
  'oops', 'role_worker', 'role_admin', 'signing_in', 'continue_google', 
  'continue_phone', 'enter_mobile', 'sending_otp', 'get_otp', 'back_options', 
  'enter_code', 'verifying', 'verify_login', 'change_phone', 'demo_login', 
  'data_safe', 'genie_partner', 'global_hq', 'default_worker', 'default_task'
];

let TRANSLATIONS_OBJ;
let evalCode = content.replace(/export const/g, 'var');
evalCode += '\nTRANSLATIONS_OBJ = TRANSLATIONS;';
eval(evalCode);

for (let lang in TRANSLATIONS_OBJ) {
    newKeys.forEach(k => {
        if (!TRANSLATIONS_OBJ[lang][k]) {
            TRANSLATIONS_OBJ[lang][k] = k.replace(/_/g, ' ').toUpperCase();
        }
    });
}

// Convert back to string
let newContent = content.substring(0, content.indexOf('export const TRANSLATIONS ='));
newContent += 'export const TRANSLATIONS = ' + JSON.stringify(TRANSLATIONS_OBJ, null, 2) + ';\n';

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully injected.');
