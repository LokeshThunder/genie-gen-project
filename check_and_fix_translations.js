import fs from 'fs';
import { TRANSLATIONS, LANGUAGES } from './src/constants/translations.js';

const englishFixes = {
  "no_biometric_data": "No biometric data recorded",
  "no_skills_initialized": "No skills initialized",
  "no_active_ops": "No active operations",
  "no_completed_records": "No completed records",
  "no_jobs_found": "No gigs found",
  "no_ops_pulse": "No activity",
  "no_pending_units": "No applications under review.",
  "gender_pref": "Gender Preference",
  "title_label": "Gig Title",
  "date_label": "Date",
  "pricing_model": "Pricing Model",
  "pincode_label": "Pincode",
  "area_label": "Area",
  "extra_info": "Extra Info",
  "planner_title": "Earnings Planner",
  "planner_subtitle": "Plan your earnings and goals",
  "login_subtitle": "Enter details to access your dashboard",
  "history_module": "Work History",
  "identity_layer": "Verification",
  "identity_pending": "Pending uploads",
  "aadhaar_core": "Aadhaar Card",
  "pan_index": "PAN Card",
  "bio_selfie": "Biometric Selfie",
  "optical_scan": "Optical Scan",
  "session_id": "Session ID",
  "req_amount": "Amount",
  "return_dashboard": "Return to Dashboard",
  "loan_step_details": "Details",
  "loan_step_eligibility": "Eligibility",
  "fill_required": "Fill Required",
  "create_job_title": "Create Job",
  "job_details_subtitle": "Enter details of the new gig",
  "placeholder_title": "e.g., Warehouse Loader",
  "placeholder_pincode": "e.g., 600020",
  "placeholder_area": "e.g., Adyar Sector 4",
  "placeholder_desc": "Describe the job requirements and duties",
  "take_selfie": "Take Selfie",
  "online_ready": "Online",
  "distance_node": "Distance",
  "exit_map": "Exit Map View",
  "urgent_priority": "Urgent Priority",
  "init_app": "Apply",
  "restart_listening": "Restart Listening",
  "filter_protocols": "Filter Gigs",
  "wage_threshold": "Daily Wage Threshold",
  "max_range": "Maximum Range (KM)",
  "apply_filters": "Apply Filters",
  "general_ops": "General Operations",
  "view_tasks": "View Tasks",
  "smart_combo": "Smart Combo",
  "batch_enabled": "Batch Enabled",
  "hiring_pipeline": "Hiring Pipeline",
  "pending_reviews": "Pending Reviews",
  "unit_anonymous": "Anonymous Worker",
  "unit_score": "Worker Score",
  "core_entry": "Core Entry",
  "exp_layer": "Experience Layer",
  "skill_nodes": "Skill Nodes",
  "reject_unit": "Decline",
  "authorize_entry": "Approve",
  "pipeline_clear": "Pipeline Clear",
  "safety_title": "Safety Module",
  "protocol_active": "Protocol Active",
  "unit_offline": "Worker Offline",
  "deactivate_protocol": "Deactivate Protocol",
  "activate_shield": "Activate Shield",
  "init_sos": "Trigger SOS",
  "core_contacts": "Emergency Contacts",
  "operational_logs": "Operational Logs",
  "logs_tab": "Logs",
  "metrics_tab": "Analytics",
  "tracking_tab": "Radar",
  "operatives_active": "Active Workers",
  "avg_yield": "Avg Completion Time",
  "protocol_sync": "Protocol Sync",
  "site_active": "Site Active",
  "data_concluded": "Data Concluded",
  "live_pulse": "Live Pulse Feed",
  "recent_activity": "Recent Activity",
  "task_nodes": "Task Nodes",
  "proof_required": "Biometric Proof Required",
  "surge_map": "Surge Map",
  "zones_locked": "Zones Locked",
  "units_active": "Active Workers",
  "associate_core": "Associate Core",
  "battery_label": "Battery",
  "call_unit": "Call Worker",
  "pulse_operations": "Pulse Operations",
  "live_sync": "Live Sync",
  "demo_bypass": "Demo Bypass",
  "corp_identity": "Corporate Identity",
  "sector_sync": "Sector Sync",
  "mission_intent": "Mission Intent",
  "initializing_core": "Initializing...",
  "capability_sync": "Capability Sync",
  "sector_preference": "Sector Preference",
  "est_corp_sig": "Establishing Corporate Signature...",
  "mapping_verticals": "Mapping Operational Verticals...",
  "defining_mission": "Defining Gig Objectives...",
  "est_identity": "Establishing Identity...",
  "mapping_skill_nodes": "Mapping Skill Nodes...",
  "config_geography": "Configuring Geography...",
  "company_legal_name": "Company Legal Name",
  "operative_name": "Operative Name",
  "enter_company_name": "Enter Company Name",
  "enter_full_name": "Enter Full Name",
  "hq_location": "Headquarters Location",
  "dob_label": "Date of Birth",
  "biometric_gender": "Gender",
  "op_scale": "Operational Scale",
  "service_history": "Service History",
  "core_competencies": "Core Competencies",
  "corp_desc": "Corporate Description",
  "pref_sectors": "Preferred Sectors",
  "enter_mission_intent": "Enter Mission Intent",
  "admin_intel": "Admin Insights",
  "core_advisory": "Core Advisory",
  "est_mission_protocol": "Establishing Mission Protocol...",
  "opt_data_nodes": "Optimizing Data...",
  "finalize_sync": "Finalize Sync",
  "continue_sync": "Continue",
  "gigs": "Gigs",
  "earnings": "Earnings",
  "pro_module": "Professional Module",
  "units": "Units",
  "privacy_safety": "Privacy & Safety",
  "shift_label": "Shift",
  "entry_registered": "Entry Registered",
  "years": "Years",
  "active_nodes": "Active Nodes",
  "headquarters": "Headquarters",
  "verified_partner": "Verified Partner",
  "flexible": "Flexible",
  "start": "Start",
  "attendance_log": "Attendance",
  "est_yield": "Estimated Yield",
  "window_locked": "3h Window Locked",
  "photo_label": "Photo",
  "video_label": "Video",
  "report_label": "Report",
  "active": "Active",
  "starter_unit": "New Worker",
  "accidental_cover": "Accidental Coverage",
  "init_enrollment": "Apply Now",
  "healthcare_protocol": "Healthcare Benefits",
  "genie_suggestion": "Genie Suggestion",
  "industrial_os_title": "The Future of Work",
  "per": "per",
  "full_time": "Full Time",
  "part_time": "Part Time",
  "day_shift": "Day Shift",
  "workforce_credit": "Workforce Credit Line",
  "int_rate": "Interest Rate",
  "tenure": "Tenure",
  "twelve_months": "12 Months",
  "proc_fee": "Processing Fee",
  "zero_fee": "Nil",
  "cibil_score": "CIBIL Score",
  "level_induction": "Level Induction",
  "level_core": "Level Core",
  "level_elite": "Level Elite",
  "level_command": "Level Command",
  "estimate": "Estimate",
  "near_future": "Near Future",
  "confidence": "Confidence",
  "confidence_high": "High Confidence",
  "best_days": "Best Days",
  "day_mon": "Monday",
  "day_wed": "Wednesday",
  "day_sat": "Saturday",
  "surge_multiplier": "Surge Multiplier",
  "your_journey": "Your Journey",
  "reached": "Reached",
  "roadmap_success": "Roadmap Success",
  "target_amount": "Target Amount",
  "login_failed": "Login Failed",
  "otp_send_failed": "OTP Send Failed",
  "otp_invalid": "OTP Invalid",
  "welcome_to": "Welcome to",
  "job_genie": "JobGenie",
  "oops": "Oops",
  "role_worker": "Worker",
  "role_admin": "Admin",
  "signing_in": "Signing In...",
  "continue_google": "Continue with Google",
  "continue_phone": "Continue with Phone",
  "enter_mobile": "Enter Mobile Number",
  "sending_otp": "Sending OTP...",
  "get_otp": "Get OTP",
  "back_options": "Back",
  "enter_code": "Enter Code",
  "verifying": "Verifying...",
  "verify_login": "Verify Login",
  "change_phone": "Change Phone",
  "demo_login": "Demo Login",
  "data_safe": "Data Safe",
  "default_worker": "Default Worker",
  "default_task": "Default Task",
  "photo": "Photo",
  "video": "Video",
  "report": "Report",
  "live_jobs": "Active",
  "draft_jobs": "Drafts",
  "live_job": "Live Gig",
  "draft_mode": "Offline Draft",
  "reviews": "Review Candidates",
  "site_evidence": "Field Evidence",
  "just_now": "Just now",
  "online": "Online",
  "working_days": "Working Days",
  "paid": "Paid",
  "match": "Match",
  "urgent": "Urgent",
  "per_day": "per day",
  "job_details": "Gig Details",
  "profile_title": "My Profile",
  "profile_strength": "Verification Level",
  "status_good": "Verified",
  "on_site": "Checked In",
  "finished": "Completed",
  "tab_logs": "Logs",
  "tab_metrics": "Analytics",
  "tab_tracking": "Radar",
  "export_csv": "Export CSV",
  "rate_now": "Rate Now",
  "active_partner": "Authorized Personnel",
  "check_in_help": "Deployment",
  "find_jobs": "Find Gigs",
  "safety_guide": "Protocols",
  "go_to": "Go to",
  "genie_assistant": "Genie AI",
  "active_label": "Ops",
  "applicants": "Candidates",
  "call": "Call",
  "reject": "Decline",
  "hire_now": "Approve",
  "caught_up": "Queue Clear",
  "verified_operator": "Verified Operator",
  "details_label": "Details",
  "tap_to_flip_front": "Tap to flip"
};

// Target translation maps for other languages
const targetTranslations = {
  "take_selfie": {
    "Hindi": "सेल्फी लें",
    "Bengali": "সেলফি তুলুন",
    "Marathi": "सेल्फी घ्या",
    "Telugu": "సెల్ఫీ తీసుకోండి",
    "Tamil": "செல்ஃபி எடுக்கவும்",
    "Gujarati": "સેલ્ફી લો",
    "Urdu": "سیلفی لیں",
    "Kannada": "ಸೆಲ್ಫಿ ತೆಗೆದುಕೊಳ್ಳಿ",
    "Odia": "ସେଲ୍ଫି ନିଅନ୍ତୁ",
    "Malayalam": "സെൽഫി എടുക്കുക"
  },
  "online_ready": {
    "Hindi": "ऑनलाइन",
    "Bengali": "অনলাইন",
    "Marathi": "ऑनलाइन",
    "Telugu": "ఆన్‌లైన్",
    "Tamil": "ஆன்லைன்",
    "Gujarati": "ઓનલાઇન",
    "Urdu": "آن لائن",
    "Kannada": "ಆನ್‌ಲೈನ್",
    "Odia": "ଅନଲାଇନ୍",
    "Malayalam": "ഓൺലൈൻ"
  },
  "gender_pref": {
    "Hindi": "लिंग वरीयता",
    "Bengali": "লিঙ্গ পছন্দ",
    "Marathi": "लिंग निवड",
    "Telugu": "లింగ ప్రాధాన్యత",
    "Tamil": "பாலின விருப்பம்",
    "Gujarati": "જાતિ પસંદગી",
    "Urdu": "صنف کی ترجیح",
    "Kannada": "ಲಿಂಗ ಆದ್ಯತೆ",
    "Odia": "ଲିଙ୍ଗ ପସନ୍ଦ",
    "Malayalam": "ലിംഗ മുൻഗണന"
  },
  "title_label": {
    "Hindi": "काम का नाम",
    "Bengali": "কাজের শিরোনাম",
    "Marathi": "कामाचे नाव",
    "Telugu": "పని శీర్షిక",
    "Tamil": "பணி தலைப்பு",
    "Gujarati": "કામનું નામ",
    "Urdu": "کام کا نام",
    "Kannada": "ಕೆಲಸದ ಶೀರ್ಷಿಕೆ",
    "Odia": "କାମର ଶୀର୍ଷକ",
    "Malayalam": "ജോലി ശീർഷകം"
  },
  "date_label": {
    "Hindi": "दिनांक",
    "Bengali": "তারিখ",
    "Marathi": "दिनांक",
    "Telugu": "తేదీ",
    "Tamil": "தேதி",
    "Gujarati": "તારીખ",
    "Urdu": "تاریخ",
    "Kannada": "ದಿನಾಂಕ",
    "Odia": "ତାରିଖ",
    "Malayalam": "തീയതി"
  }
};

// Apply English fixes
Object.entries(englishFixes).forEach(([key, val]) => {
  TRANSLATIONS.English[key] = val;
});

// Clean up all other languages
Object.entries(TRANSLATIONS).forEach(([lang, dict]) => {
  Object.keys(dict).forEach(key => {
    // If the value in this language is the same as the English all-caps / sci-fi value,
    // or has a trailing pipe / weird spacing, clean it up!
    let val = dict[key];
    if (typeof val === 'string') {
      val = val.trim();
      if (val.endsWith('|')) {
        val = val.slice(0, -1).trim();
      }
      dict[key] = val;
    }

    // Check if the value is untranslated (i.e. matches raw uppercase English placeholder)
    const isRaw = /^[A-Z0-9_\s]{3,}$/.test(val) && !/^[0-9]+$/.test(val);
    
    if (lang !== 'English' && isRaw) {
      // 1. If we have a target translation for this language/key, use it!
      if (targetTranslations[key] && targetTranslations[key][lang]) {
        dict[key] = targetTranslations[key][lang];
      } else {
        // 2. Otherwise, fall back to the clean English translation instead of the ugly uppercase key!
        if (TRANSLATIONS.English[key]) {
          dict[key] = TRANSLATIONS.English[key];
        }
      }
    }
  });

  // Explicitly apply targeted fixes for other languages if they are still all-caps
  Object.entries(targetTranslations).forEach(([key, langMap]) => {
    if (langMap[lang]) {
      dict[key] = langMap[lang];
    }
  });
});

// Re-generate translations.js content
const output = `export const LANGUAGES = ${JSON.stringify(LANGUAGES, null, 2)};

export const TRANSLATIONS = ${JSON.stringify(TRANSLATIONS, null, 2)};
`;

fs.writeFileSync('./src/constants/translations.js', output, 'utf8');
console.log("Translations successfully cleaned and updated across all languages!");
