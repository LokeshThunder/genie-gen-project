import { GoogleGenerativeAI } from "@google/generative-ai";
import { OPERATIONAL_LOGS } from "./operationalService.js";
import { GLOBAL_KNOWLEDGE } from "./knowledgeService.js";
import { TRANSLATIONS } from "../constants/translations.js";
import { sanitizeText } from "./securityService.js";

// ─── SAFE WHITELIST ACCESSOR ──────────────────────────────────────────────────
// CWE-94 fix: Never use obj[userInput] directly.
// This function validates the key against a fixed whitelist before lookup.
const SAFE_LANG_KEYS = ['English','Hindi','Bengali','Marathi','Telugu','Tamil','Gujarati','Urdu','Kannada','Odia','Malayalam'];
const SAFE_SIM_KEYS  = ['getAdminInsights','chatFeedback','magicCreateJob'];

function safeLangLookup(obj, lang) {
  const key = SAFE_LANG_KEYS.includes(lang) ? lang : 'English';
  return obj[key] || obj['English'];
}

function safeSimLookup(key) {
  if (!SAFE_SIM_KEYS.includes(key)) return null;
  const sim = JITRO_SIMS[key];
  if (Array.isArray(sim)) return sim[Math.floor(Math.random() * sim.length)];
  return sim;
}

// Jitro Engine Configuration
const API_KEY = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : (typeof process !== 'undefined' ? process.env.VITE_GEMINI_API_KEY : undefined);
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const modelOptions = { apiVersion: "v1" };

const FALLBACK_TRANSLATIONS = {
  "English": {
    "opening_jobs": "Opening the Job Portal for you... 🧞✨",
    "opening_earnings": "Opening your earnings dashboard locally. 💰",
    "user_status": "You are a {role} with {xp} XP.",
    "chatbot_help": "I can help with finding jobs, checking earnings, or tracking XP. Just ask!",
    "hybrid_fallback": "Jitro Hybrid-Local Mode: Try 'Find a job' or 'Check my pay'."
  },
  "Hindi": {
    "opening_jobs": "आपके लिए जॉब पोर्टल खोल रहा हूँ... 🧞✨",
    "opening_earnings": "आपका कमाई डैशबोर्ड खोल रहा हूँ। 💰",
    "user_status": "आप {xp} XP वाले {role} हैं।",
    "chatbot_help": "मैं नौकरी खोजने, कमाई की जांच करने या XP को ट्रैक करने में मदद कर सकता हूँ। बस पूछें!",
    "hybrid_fallback": "जिट्रो हाइब्रिड-लोकल मोड: 'नौकरी ढूंढें' या 'मेरा वेतन जांचें' का प्रयास करें।"
  },
  "Bengali": {
    "opening_jobs": "আপনার জন্য জব পোর্টাল খোলা হচ্ছে... 🧞✨",
    "opening_earnings": "আপনার উপার্জনের ড্যাশবোর্ড খোলা হচ্ছে। 💰",
    "user_status": "আপনি {xp} XP সহ একজন {role}।",
    "chatbot_help": "আমি চাকরি খুঁজতে, উপার্জন পরীক্ষা করতে বা XP ট্র্যাক করতে সাহায্য করতে পারি। জিজ্ঞাসা করুন!",
    "hybrid_fallback": "জিট্রো হাইব্রিড-লোকাল মোড: 'চাকরি খুঁজুন' বা 'আমার বেতন পরীক্ষা করুন' চেষ্টা করুন।"
  },
  "Marathi": {
    "opening_jobs": "तुमच्यासाठी जॉब पोर्टल उघडत आहे... 🧞✨",
    "opening_earnings": "तुमचे कमाई डॅशबोर्ड उघडत आहे. 💰",
    "user_status": "तुमही {xp} XP असलेले {role} आहात.",
    "chatbot_help": "मी नोकऱ्या शोधण्यात, कमाई तपासण्यात किंवा XP ट्रॅक करण्यात मदत करू शकतो. फक्त विचारा!",
    "hybrid_fallback": "जिट्रो हायब्रिड-लोकल मोड: 'नोकरी शोधा' किंवा 'माझे वेतन तपासा' चा प्रयत्न करा."
  },
  "Telugu": {
    "opening_jobs": "మీ కోసం జాబ్ పోర్టల్ తెరవబడుతోంది... 🧞✨",
    "opening_earnings": "మీ సంపాదన డాష్‌బోర్డ్ తెరవబడుతోంది. 💰",
    "user_status": "మీరు {xp} XPతో {role}.",
    "chatbot_help": "నేను ఉద్యోగాలను కనుగొనడం, సంపాదనను తనిఖీ చేయడం లేదా XPని ట్రాక్ చేయడంలో సహాయపడగలను. అడగండి!",
    "hybrid_fallback": "జిట్రో హైబ్రిడ్-లోకల్ మోడ్: 'ఉద్యోగాన్ని కనుగొనండి' లేదా 'నా జీతం తనిఖీ చేయండి' అని ప్రయత్నించండి."
  },
  "Tamil": {
    "opening_jobs": "உங்களுக்காக வேலை போர்ட்டலைத் திறக்கிறது... 🧞✨",
    "opening_earnings": "உங்கள் வருவாய் டாஷ்போர்டை உள்நாட்டில் திறக்கிறது. 💰",
    "user_status": "நீங்கள் {xp} எக்ஸ்பியுடன் {role} ஆக இருக்கிறீர்கள்.",
    "chatbot_help": "வேலைகளைக் கண்டறிதல், வருவாயைச் சரிபார்த்தல் அல்லது எக்ஸ்பியைக் கண்காணிப்பதில் நான் உதவ முடியும். கேளுங்கள்!",
    "hybrid_fallback": "ஜிட்ரோ ஹைப்ரிட்-உள்ளூர் பயன்முறை: 'வேலையைக் கண்டுபிடி' அல்லது 'எனது ஊதியத்தைச் சரிபார்' என்று முயற்சிக்கவும்."
  },
  "Gujarati": {
    "opening_jobs": "તમારા માટે જોಬ પોર્ટલ ખોલી રહ્યું છે... 🧞✨",
    "opening_earnings": "તમારું કમાણી ડેશબોર્ડ ખોલી રહ્યું છે. 💰",
    "user_status": "તમે {xp} XP સાથે {role} છો.",
    "chatbot_help": "હું નોકરી શોધવા, કમાણી તપાસવા અથવા XP ટ્રેક કરવામાં મદદ કરી શકું છું. બસ પૂછો!",
    "hybrid_fallback": "જીટ્રો હાઇબ્રિડ-લોકલ મોડ: 'નોકરી શોધો' અથવા 'મારી કમાણી તપાસો' નો પ્રયાસ કરો."
  },
  "Urdu": {
    "opening_jobs": "آپ کے لیے جاب پورٹل کھولا جا رہا ہے... 🧞✨",
    "opening_earnings": "آپ کی کمائی کا ڈیش بورڈ کھولا جا رہا ہے۔ 💰",
    "user_status": "آپ {xp} XP کے ساتھ ایک {role} ہیں۔",
    "chatbot_help": "میں نوکری تلاش کرنے، کمائی چیک کرنے، یا XP کو ٹریک کرنے میں مدد کر سکتا ہوں۔ بس پوچھیں!",
    "hybrid_fallback": "جیٹرو ہائبرڈ-لوکل موڈ: 'نوکری تلاش کریں' یا 'میری تنخواہ چیک کریں' آزمائیں۔"
  },
  "Kannada": {
    "opening_jobs": "ನಿಮಗಾಗಿ ಉದ್ಯೋಗ ಪೋರ್ಟಲ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ... 🧞✨",
    "opening_earnings": "ನಿಮ್ಮ ಗಳಿಕೆಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ. 💰",
    "user_status": "ನೀವು {xp} XP ಹೊಂದಿರುವ {role} ಆಗಿದ್ದೀರಿ.",
    "chatbot_help": "ನಾನು ಉದ್ಯೋಗಗಳನ್ನು ಹುಡುಕಲು, ಗಳಿಕೆಯನ್ನು ಪರಿಶೀಲಿಸಲು ಅಥವಾ XP ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಸಹಾಯ ಮಾಡಬಹುದು. ಕೇಳಿ!",
    "hybrid_fallback": "ಜಿಟ್ರೋ ಹೈಬ್ರಿಡ್-ಲೋಕಲ್ ಮೋಡ್: 'ಉದ್ಯೋಗ ಹುಡುಕಿ' ಅಥವಾ 'ನನ್ನ ವೇತನ ಪರಿಶೀಲಿಸಿ' ಎಂದು ಪ್ರಯತ್ನಿಸಿ."
  },
  "Odia": {
    "opening_jobs": "ଆପଣଙ୍କ ପାଇଁ ଜବ୍ ପୋର୍ଟାଲ୍ ଖୋଲାଯାଉଛି... 🧞✨",
    "opening_earnings": "ଆପଣଙ୍କ ରୋଜଗାର ଡ୍ୟାସବୋର୍ଡ ଖୋଲାଯାଉଛି। 💰",
    "user_status": "ଆପଣ {xp} XP ସହିତ ଜଣେ {role} ଅଟନ୍ତି।",
    "chatbot_help": "ମୁଁ ଚାକିରି ଖୋଜିବା, ରୋଜଗାର ଯାଞ୍ಚ କରିବା କିମ୍ବା XP ଟ୍ରାକ୍ କରିବାରେ ସାହାଯ್ಯ କରିପାରିବି। କେବଳ ପଚାରନ୍ତୁ!",
    "hybrid_fallback": "ଜିଟ୍ରୋ ହାଇବ୍ରିଡ୍-ଲୋକାଲ୍ ମୋଡ୍: 'ଚାକିରି ଖୋଜନ୍ତୁ' କିମ୍ବା 'ମୋର ଦರମା ଯାଞ୍ಚ କରନ୍ତು' ଚେଷ୍ଟା କରନ୍ତು।"
  },
  "Malayalam": {
    "opening_jobs": "നിങ്ങൾക്കായി ജോബ് പോർട്ടൽ തുറക്കുന്നു... 🧞✨",
    "opening_earnings": "നിങ്ങളുടെ വരുമാന ഡാഷ്‌ബോർഡ് തുറക്കുന്നു. 💰",
    "user_status": "നിങ്ങൾ {xp} എക്സ്പിയുള്ള ഒരു {role} ആണ്.",
    "chatbot_help": "ജോലികൾ കണ്ടെത്തുന്നതിനും വരുമാനം പരിശോധിക്കുന്നതിനും അല്ലെങ്കിൽ എക്സ്പി ട്രാക്ക് ചെയ്യുന്നതിനും എനിക്ക് സഹായിക്കാനാകും. ചോദിക്കൂ!",
    "hybrid_fallback": "ജിട്രോ ഹൈബ്രിഡ്-ലോക്കൽ മോഡ്: 'ഒരു ജോലി കണ്ടെത്തുക' അല്ലെങ്കിൽ 'എന്റെ ശമ്പളം പരിശോധിക്കുക' എന്ന് ശ്രമിക്കുക."
  }
};

/**
 * Jitro AI Simulation Engine: Curated fallback knowledge
 */
const JITRO_SIMS = {
  getAdminInsights: [
    "Worker retention is up 12% following the recent wage adjustment in Logistics.",
    "Madipakkam hub shows a 94% fulfillment rate today."
  ],
  chatFeedback: "I'm currently optimizing my strategic models. How else can I assist with operations?",
  magicCreateJob: {
    title: "Express Warehouse Packer",
    description: "Handle high-priority logistics packing in Madipakkam hub.",
    wage: "750",
    workerCount: "8",
    type: "day",
    startTime: "09:00",
    endTime: "18:00",
    category: "Logistics",
    pricingModel: "daily",
    pincode: "600091",
    locationName: "Madipakkam",
    requirementsTags: ["Aadhaar Card", "Safety Shoes"],
    gender: "Any",
    incentives: "Bonus for 100% attendance"
  }
};

// getSim now uses the whitelisted safeSimLookup — see definition above
const getSim = (key) => safeSimLookup(key);

/**
 * Helper to extract and sanitize JSON from model responses
 */
const extractJSON = (text) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return null;
  } catch (e) {
    return null;
  }
};

export const aiService = {
  /**
   * Internal helper for robust model initialization and execution.
   */
  async runSafeQuery(message, systemInstruction, history = []) {
    if (!genAI) throw new Error("AI Engine Offline");

    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName }, modelOptions);
        const fullPrompt = systemInstruction ? `${systemInstruction}\n\nUSER MESSAGE: ${message}` : message;

        const chatSession = model.startChat({
          history: history,
          generationConfig: { maxOutputTokens: 2000, temperature: 0.7 }
        });

        const result = await chatSession.sendMessage(fullPrompt);
        return result.response.text();
      } catch (err) {
        console.warn(`Jitro Fallback: ${modelName} failed.`, err);
        lastError = err;
      }
    }
    throw lastError || new Error("All models failed");
  },

  /**
   * Universal Chat function with Hybrid AI
   */
  async chat(message, history = [], isAdmin = false, userContext = null, selectedLanguage = 'English') {
    // Removed strict offline check to allow Hybrid-Local fallback mode

    let systemInstruction = "";
    if (isAdmin) {
      systemInstruction = `You are "THE FUTURE OF WORK Partner Assistant". Help the partner manage their workforce, track fulfillment, and optimize hiring. Return JSON output only. Context: ${JSON.stringify(GLOBAL_KNOWLEDGE)}`;
    } else {
      systemInstruction = `You are "THE ELITE CONCIERGE Assistant" for JobGenie. Your persona is highly professional, business-savvy, encouraging, and sophisticated. You are a talent manager helping premium gig workers find missions, optimize their profiles, and plan their career. Speak in a confident, encouraging, elite agent tone. Always return JSON output only. User Context: ${JSON.stringify(userContext)}. Current Market Data: ${JSON.stringify(userContext?.availableJobs || [])}`;
    }

    if (selectedLanguage && selectedLanguage !== 'English') {
      systemInstruction += `\nIMPORTANT: You MUST write all user-facing text, message, content, and description values in the JSON in the user's selected language: ${selectedLanguage}. Do not translate technical keys, screen names, or parameter keys.`;
    }

    try {
      const formattedHistory = [];
      const realMessages = history.filter(h => h.rawText || h.text);
      const startIdx = realMessages.length > 0 && realMessages[0].isBot ? 1 : 0;
      for (let i = startIdx; i < realMessages.length; i++) {
        const h = realMessages[i];
        formattedHistory.push({
          role: h.isBot ? 'model' : 'user',
          parts: [{ text: h.rawText || h.text }],
        });
      }

      const textResponse = await this.runSafeQuery(message, systemInstruction, formattedHistory);
      const jsonResponse = extractJSON(textResponse);
      if (jsonResponse) return jsonResponse;
      return { type: 'text', content: textResponse };

    } catch (error) {
      console.warn("Jitro Hybrid-Local Mode engaged.");
      const msg = message.toLowerCase();
      // CWE-94 fix: validate lang against whitelist before bracket access
      const lang = SAFE_LANG_KEYS.includes(selectedLanguage) && safeLangLookup(FALLBACK_TRANSLATIONS, selectedLanguage) ? selectedLanguage : 'English';
      const strings = safeLangLookup(FALLBACK_TRANSLATIONS, lang);
      
      const hasJobKeyword = msg.includes("job") || msg.includes("find") || msg.includes("search") || msg.includes("work") || msg.includes("gig") ||
                            msg.includes("வேலை") || msg.includes("தேடு") ||
                            msg.includes("ജോലി") || msg.includes("തിരയുക") ||
                            msg.includes("काम") || msg.includes("नौकरी") || msg.includes("खोज") ||
                            msg.includes("কাজ") || msg.includes("চাকরি") ||
                            msg.includes("పని") || msg.includes("ఉద్యోగం") ||
                            msg.includes("ಕೆಲಸ") || msg.includes("ಹುಡುಕು") ||
                            msg.includes("କାମ") || msg.includes("ଚାକିରି");

      const hasEarnKeyword = msg.includes("earn") || msg.includes("salary") || msg.includes("pay") || msg.includes("earnings") || msg.includes("money") ||
                             msg.includes("வருவாய்") || msg.includes("ஊதியம்") || msg.includes("பணம்") ||
                             msg.includes("വരുമാനം") || msg.includes("ശമ്പളം") || msg.includes("പണം") ||
                             msg.includes("कमाई") || msg.includes("वेतन") || msg.includes("पैसा") ||
                             msg.includes("উপার্জন") || msg.includes("বেতন") || msg.includes("টাকা") ||
                             msg.includes("సంపాదన") || msg.includes("జీతం") || msg.includes("డబ్బు") ||
                             msg.includes("ಗಳಿಕೆ") || msg.includes("ವೇತನ") || msg.includes("ಹಣ") ||
                             msg.includes("ରୋଜଗାର") || msg.includes("ଦരମಾ") || msg.includes("ଟଙ୍କา");

      const hasStatusKeyword = msg.includes("xp") || msg.includes("level") || msg.includes("role") || msg.includes("who am i") ||
                               msg.includes("நான் யார்") || msg.includes("ഞാൻ ആരാണ്") || msg.includes("मैं कौन हूँ") || msg.includes("मैं कौन हूं");

      const hasHelpKeyword = msg.includes("help") || msg.includes("how to") || msg.includes("check in") ||
                             msg.includes("உதவி") || msg.includes("സഹായം") || msg.includes("मदद");

      if (hasJobKeyword) {
        return {
          type: "navigation",
          screen: "Find Job",
          params: { search: msg.includes("madipakkam") || msg.includes("மடிப்பாக்கம்") || msg.includes("മടിപ്പാക്കം") ? "Madipakkam" : "" },
          message: strings.opening_jobs
        };
      }
      
      if (hasEarnKeyword) {
        return { type: "navigation", screen: "Earnings", message: strings.opening_earnings };
      }

      if (hasStatusKeyword) {
        if (userContext) {
          const roleKey = userContext.role === 'worker' ? 'worker_label' : 'admin_label';
          // CWE-94 fix: use safeLangLookup instead of TRANSLATIONS[lang]
          const langTranslations = safeLangLookup(TRANSLATIONS, lang);
          const roleName = langTranslations && langTranslations[roleKey] ? langTranslations[roleKey] : (userContext.role || 'Worker');
          const statusPattern = strings.user_status || "You are a {role} with {xp} XP.";
          // CWE-79 fix: sanitize role/xp before embedding in output string
          const safeRole = sanitizeText(String(roleName), 50);
          const safeXP   = String(parseInt(userContext.xp, 10) || 0);
          const content = statusPattern.replace("{role}", safeRole).replace("{xp}", safeXP);
          return { type: "text", content };
        }
      }

      if (hasHelpKeyword) {
        return { type: "text", content: strings.chatbot_help };
      }

      return { type: 'text', content: strings.hybrid_fallback };
    }
  },

  async getJobMatches(profile, availableJobs) {
    try {
      // CWE-79 fix: sanitize profile fields before embedding in AI prompt
      const safeProfile = {
        name:   sanitizeText(profile?.name || '', 100),
        skills: (profile?.skills || []).map(s => sanitizeText(s, 50)),
        role:   sanitizeText(profile?.role || '', 30),
      };
      const prompt = `Match profile to jobs. Return JSON. Profile: ${JSON.stringify(safeProfile)}`;
      const text = await this.runSafeQuery(prompt, "You are a Job Match Engine.");
      return extractJSON(text) || availableJobs.slice(0, 2);
    } catch (e) {
      return availableJobs.slice(0, 2);
    }
  },

  async getAdminInsights(statsData) {
    try {
      return await this.runSafeQuery(`Stats: ${JSON.stringify(statsData)}`, "Provide 1 admin insight.");
    } catch (e) {
      return getSim('getAdminInsights');
    }
  },

  async processVoiceCommand(transcript) {
    try {
      // CWE-79 fix: sanitize voice transcript before embedding in AI prompt
      const safeTranscript = sanitizeText(transcript || '', 500);
      const text = await this.runSafeQuery(`Transcript: ${safeTranscript}`, "Extract intent: [FIND_JOBS, VIEW_EARNINGS]. Result JSON.");
      return extractJSON(text) || { intent: 'UNKNOWN', feedback: "Didn't catch that." };
    } catch (e) {
      return { intent: 'UNKNOWN', feedback: "Didn't catch that." };
    }
  },

  async getEarningsForecast(goal, currentXP) {
    return { advice: "Keep working consistently!" };
  },

  async getHeatmapData() {
    return [
      { id: 'sz1', lat: 35, long: 25, intensity: 0.8, label: 'Chennai South' },
      { id: 'sz2', lat: 65, long: 75, intensity: 0.6, label: 'Ambattur Hub' }
    ];
  },

  async magicCreateJob(userPrompt) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const systemPrompt = `You are a high-precision parser for the Job Genie recruitment app.
Analyze the user's recruitment request and extract all possible fields:
- title (string: e.g. "Logistics Packer", "Loader")
- description (string: brief summary)
- wage (number as string: pay rate per worker, e.g. "500")
- workerCount (number as string: number of workers needed, e.g. "10")
- startDate (string: YYYY-MM-DD, parse words like 'tomorrow' based on today's date: ${todayStr})
- startTime (string: HH:MM, default "08:00")
- endTime (string: HH:MM, default "17:00")
- pincode (string: 6-digit postal code)
- locationName (string: area name, e.g. "Madipakkam")
- category (string: Logistics | Construction | Manufacturing | Hospitality | Security | Cleaning | Retail | Office. Select the best match)
- gender (string: "Any", "Male", or "Female")

Identify if any of these critical fields are missing: title, wage, pincode, locationName, workerCount, startDate, startTime, endTime, description, gender.
Return a JSON object in this EXACT format:
{
  "parsed": {
    "title": "Loader",
    "description": "Moving packages",
    "wage": "400",
    "workerCount": "10",
    "startDate": "2026-05-21",
    "startTime": "08:00",
    "endTime": "17:00",
    "pincode": "",
    "locationName": "Madipakkam",
    "category": "Logistics",
    "gender": "Any"
  },
  "missingFields": ["title", "pincode", "startDate"],
  "questions": {
    "title": "What job title should we display for these 10 workers?",
    "pincode": "What is the 6-digit postal Pincode for the Madipakkam location?",
    "startDate": "On which date should this job begin?"
  }
}
If a field is missing, keep its value as empty string ("") in "parsed", add it to "missingFields", and provide a clear, simple, friendly question in "questions".`;

    try {
      // CWE-79 fix: sanitize user prompt before sending to AI
      const safePrompt = sanitizeText(userPrompt || '', 1000);
      const responseText = await this.runSafeQuery(`User recruitment request: "${safePrompt}"`, systemPrompt);
      const parsedJSON = extractJSON(responseText);
      if (parsedJSON && parsedJSON.parsed) {
        // Double check missingFields array matches empty fields
        const reqFields = ['title', 'wage', 'pincode', 'locationName', 'workerCount', 'startDate', 'startTime', 'endTime', 'description', 'gender'];
        parsedJSON.missingFields = reqFields.filter(f => !parsedJSON.parsed[f]);
        return parsedJSON;
      }
      throw new Error("Invalid parser response");
    } catch (e) {
      console.warn("Jitro Parsing Fallback Engaged:", e);
      return this.localParseJobPrompt(userPrompt);
    }
  },

  localParseJobPrompt(prompt) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayStr = today.toISOString().slice(0, 10);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    const parsed = {
      title: "",
      description: "",
      wage: "",
      workerCount: "",
      startDate: "",
      startTime: "",
      endTime: "",
      pincode: "",
      locationName: "",
      category: "Logistics",
      gender: ""
    };

    // Clean prompt
    const text = prompt.toLowerCase();

    // 1. Worker Count
    const workerMatch = text.match(/(\d+)\s*(?:worker|people|men|women|staff|loader|packer|helper|head|laborer)/i) || text.match(/need\s+(\d+)/i) || text.match(/(\d+)\s*head/i);
    if (workerMatch) parsed.workerCount = workerMatch[1];

    // 2. Wage
    const wageMatch = text.match(/(?:rs|rupees|₹|inr)\s*(\d+)/i) || text.match(/(\d+)\s*(?:rs|rupees|₹|inr|per head|per day)/i);
    if (wageMatch) parsed.wage = wageMatch[1];

    // 3. Pincode
    const pinMatch = text.match(/\b(\d{6})\b/);
    if (pinMatch) parsed.pincode = pinMatch[1];

    // 4. Location Name
    const locMatch = text.match(/(?:in|at|for|near)\s+([a-zA-Z\s]{3,15?})(?:\s+for|\s+at|\s+pincode|\s+with|\s+rupees|\s+rs|\b\d{6}\b|$)/i);
    if (locMatch) {
      const loc = locMatch[1].trim();
      parsed.locationName = loc.charAt(0).toUpperCase() + loc.slice(1);
    } else if (text.includes("madipakkam")) {
      parsed.locationName = "Madipakkam";
    } else if (text.includes("adyar")) {
      parsed.locationName = "Adyar";
    }

    // 5. Title & Category Heuristics
    if (text.includes("packer") || text.includes("packing")) {
      parsed.title = "Warehouse Packer";
      parsed.category = "Logistics";
    } else if (text.includes("loader") || text.includes("loading")) {
      parsed.title = "Warehouse Loader";
      parsed.category = "Logistics";
    } else if (text.includes("clean") || text.includes("cleaning") || text.includes("housekeeping")) {
      parsed.title = "Housekeeping Staff";
      parsed.category = "Cleaning";
    } else if (text.includes("security") || text.includes("guard")) {
      parsed.title = "Security Guard";
      parsed.category = "Security";
    } else if (text.includes("helper") || text.includes("assistant")) {
      parsed.title = "General Helper";
      parsed.category = "Logistics";
    }

    // Default title if not found but count is present
    if (!parsed.title && parsed.locationName) {
      parsed.title = `General Staff - ${parsed.locationName}`;
    }

    // 6. Date
    if (text.includes("tomorrow")) {
      parsed.startDate = tomorrowStr;
    } else if (text.includes("today")) {
      parsed.startDate = todayStr;
    }

    const reqFields = ['title', 'wage', 'pincode', 'locationName', 'workerCount', 'startDate', 'startTime', 'endTime', 'description', 'gender'];
    const missingFields = reqFields.filter(f => !parsed[f]);

    const defaultQuestions = {
      title: "What is the job title or designation of the workers?",
      wage: "What is the daily wage (₹) you want to offer per worker?",
      pincode: "Could you specify the 6-digit Pincode of the workspace location?",
      locationName: "Which specific area or location name is the workplace in?",
      workerCount: "How many workers do you need for this job?",
      startDate: "On which date should the work start? (e.g., Today, Tomorrow, or YYYY-MM-DD)",
      startTime: "At what time does the shift start? (e.g., 08:00 AM)",
      endTime: "At what time does the shift end? (e.g., 05:00 PM)",
      description: "Can you provide a brief description of the daily tasks?",
      gender: "Do you have any gender preference for this role? (Any, Male, or Female)"
    };

    const questions = {};
    missingFields.forEach(f => {
      questions[f] = defaultQuestions[f];
    });

    return {
      parsed,
      missingFields,
      questions
    };
  },

  async parseFieldAnswer(fieldName, userAnswer, context = {}) {
    const todayStr = new Date().toISOString().slice(0, 10);
    // CWE-79 fix: whitelist fieldName and sanitize userAnswer before embedding in prompt
    const ALLOWED_FIELDS = ['title','wage','pincode','locationName','workerCount','startDate','startTime','endTime','description','gender'];
    const safeFieldName = ALLOWED_FIELDS.includes(fieldName) ? fieldName : 'description';
    const safeAnswer    = sanitizeText(userAnswer || '', 500);
    const systemPrompt = `You are a high-precision parser for the Job Genie recruitment app.
The user is answering a conversational question for the missing field: "${safeFieldName}".
User's Answer: "${safeAnswer}"
Context (current parsed draft): ${JSON.stringify(context)}

Extract the specific value for "${fieldName}" from the user's answer.
- If the field is "startDate", format it as "YYYY-MM-DD" (today is ${todayStr}). Parse words like 'tomorrow' or 'today'.
- If the field is "startTime" or "endTime", format it as "HH:MM" in 24-hour time.
- If the field is "gender", format it strictly as "Any", "Male", or "Female".
- If the field is "pincode", it must be a 6-digit number.
- If the field is "wage", it must be a numeric value representing pay.
- If the field is "workerCount", it must be a numeric value representing the number of workers.
- If the field is "locationName", "title", or "description", return the clean text value.

Return a JSON object in this EXACT format:
{
  "value": "extracted value",
  "success": true
}
If you absolutely cannot find a valid value in their answer, return {"success": false}.`;

    try {
      const responseText = await this.runSafeQuery(`Parsing answer: "${safeAnswer}" for field "${safeFieldName}"`, systemPrompt);
      const parsedJSON = extractJSON(responseText);
      if (parsedJSON && parsedJSON.success) {
        return parsedJSON.value;
      }
      throw new Error("Gemini parser failed or returned success false");
    } catch (e) {
      console.warn("Jitro Answer Parsing Fallback.");
      return this.localParseAnswer(safeFieldName, safeAnswer);
    }
  },

  localParseAnswer(fieldName, answer) {
    const text = answer.toLowerCase().trim();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayStr = today.toISOString().slice(0, 10);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    if (fieldName === 'startDate') {
      if (text.includes("tomorrow")) return tomorrowStr;
      if (text.includes("today")) return todayStr;
      const dateMatch = text.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/) || text.match(/\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b/);
      if (dateMatch) {
        try {
          const d = new Date(text);
          if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
        } catch (e) {}
      }
      return tomorrowStr; // default fallback
    }

    if (fieldName === 'startTime') {
      if (text.includes("9") || text.includes("nine")) return "09:00";
      return "08:00"; // fallback
    }
    
    if (fieldName === 'endTime') {
      if (text.includes("6") || text.includes("six")) return "18:00";
      return "17:00"; // fallback
    }

    if (fieldName === 'gender') {
      if (text.includes("male") && !text.includes("female")) return "Male";
      if (text.includes("female") || text.includes("women") || text.includes("girls")) return "Female";
      return "Any";
    }

    if (fieldName === 'pincode') {
      const match = text.match(/\b(\d{6})\b/);
      return match ? match[1] : "";
    }

    if (fieldName === 'wage' || fieldName === 'workerCount') {
      const match = text.match(/\b(\d+)\b/);
      return match ? match[1] : "";
    }

    if (fieldName === 'description') {
      return answer.trim();
    }

    // For title and locationName, return capitalized string
    return answer.trim().charAt(0).toUpperCase() + answer.trim().slice(1);
  },

  async predictEarnings(goalAmount, timelineDays, userContext = {}) {
    const prompt = `Goal: Earn ₹${goalAmount} in ${timelineDays} days. 
    User XP: ${userContext.xp || 0}. 
    User Level: ${userContext.level || 1}.
    Suggest a strategy with specific shift types (Day/Night) and sectors to reach this goal.`;
    
    try {
      const response = await this.runSafeQuery(prompt);
      return response;
    } catch (e) {
      // Fallback logic
      return {
        message: `To earn ₹${goalAmount}, prioritize high-paying Logistics night shifts which offer a 15% premium. You need approximately ₹${Math.round(goalAmount/timelineDays)} per day.`,
        suggestions: ['Night Shift - Warehouse', 'Urgent Delivery', 'Inventory Lead']
      };
    }
  },

  async generateBio(name, role, skills, experience) {
    // CWE-79 fix: sanitize all user-supplied fields before embedding in AI prompt
    const safeName       = sanitizeText(name || '', 100);
    const safeRole       = sanitizeText(role || '', 50);
    const safeSkills     = (skills || []).map(s => sanitizeText(s, 50));
    const safeExperience = sanitizeText(experience || '', 100);
    const prompt = `Create a professional and catchy 2-sentence bio for a ${safeRole} named ${safeName}. 
    Skills: ${safeSkills.join(', ')}. Experience: ${safeExperience}.
    The bio should sound industrial and modern. Keep it under 200 characters.`;
    try {
      return await this.runSafeQuery(prompt, "You are a professional profile writer.");
    } catch (e) {
      return `Experienced ${safeRole} specializing in ${safeSkills.slice(0, 2).join(' and ')}. Dedicated to operational excellence.`;
    }
  },

  async generateVision(companyName, sector, scale) {
    // CWE-79 fix: sanitize all user-supplied fields
    const safeCo     = sanitizeText(companyName || '', 100);
    const safeSector = sanitizeText(sector || '', 50);
    const safeScale  = String(parseInt(scale, 10) || 0);
    const prompt = `Create a professional and inspiring 2-sentence company vision for ${safeCo} operating in the ${safeSector} sector with a scale of ${safeScale} workers.
    Focus on growth, efficiency, and the future of industrial operations. Keep it under 250 characters.`;
    try {
      return await this.runSafeQuery(prompt, "You are a corporate branding expert.");
    } catch (e) {
      return `Leading ${safeSector} sector operations through innovation and scale. Empowering the future workforce of ${safeCo}.`;
    }
  },

  async tailorApplication(profile, job, selectedLanguage = 'English') {
    // CWE-79 fix: sanitize all profile and job fields before embedding in AI prompt
    const safeName       = sanitizeText(profile?.name || 'Worker', 100);
    const safeSkills     = (profile?.skills || []).map(s => sanitizeText(s, 50)).join(', ') || 'General Labor';
    const safeExperience = sanitizeText(profile?.experience || 'Experienced', 100);
    const safeTitle      = sanitizeText(job?.title || '', 150);
    const safeDesc       = sanitizeText(job?.description || '', 300);
    const safeReqs       = (job?.requirementsTags || []).map(r => sanitizeText(r, 50)).join(', ');
    // CWE-94 fix: whitelist the language before embedding
    const safeLang       = SAFE_LANG_KEYS.includes(selectedLanguage) ? selectedLanguage : 'English';
    const prompt = `You are a professional application tailor for a high-end gig worker.
    Profile details:
    Name: ${safeName}
    Skills: ${safeSkills}
    Experience: ${safeExperience}
    
    Target Job details:
    Title: ${safeTitle}
    Description: ${safeDesc}
    Requirements: ${safeReqs}
    
    Analyze the profile and the job. Generate 3 short bullet points (in 1-2 sentences each) explaining why this worker is a perfect match for the job. Focus on skills alignment and experience.
    IMPORTANT: You MUST write the response in the user's selected language: ${safeLang}.
    Return a JSON array of strings: ["Bullet 1", "Bullet 2", "Bullet 3"]. Do not include markdown wraps like \`\`\`json.`;
    
    try {
      const responseText = await this.runSafeQuery(prompt, "You are a professional recruiting assistant.");
      const parsed = extractJSON(responseText);
      if (Array.isArray(parsed) && parsed.length >= 3) return parsed;
      if (parsed && typeof parsed === 'object') {
        const values = Object.values(parsed);
        if (values.length >= 3) return values.slice(0, 3);
      }
      const bullets = responseText.split('\n')
        .map(b => b.replace(/^[-*•\d.\s]+/, '').trim())
        .filter(b => b.length > 10);
      if (bullets.length >= 3) return bullets.slice(0, 3);
      throw new Error("Could not parse bullets");
    } catch (e) {
      console.warn("AI Tailor Application Fallback engaged:", e);
      const localBullets = {
        'English': [
          `Experienced in ${profile?.skills?.slice(0, 2).join(' and ') || 'industrial tasks'} matching the core needs of ${job?.title || 'this role'}.`,
          `Fulfills the key requirement of having ${job?.requirementsTags?.slice(0, 2).join(' or ') || 'physical fitness and proper credentials'}.`,
          `Ready to deploy immediately at the ${job?.locationName || 'designated location'} with high operational standards.`
        ],
        'Tamil': [
          `${job?.title || 'இந்தப் பணி'}க்கான முக்கியத் தேவைகளுடன் பொருந்தக்கூடிய ${profile?.skills?.slice(0, 2).join(' மற்றும் ') || 'தொழில்துறை பணிகளில்'} அனுபவம் வாய்ந்தவர்.`,
          `${job?.requirementsTags?.slice(0, 2).join(' அல்லது ') || 'உடற்தகுதி மற்றும் சரியான சான்றுகளை'} வைத்திருக்கும் முக்கியத் தேவையைப் பூர்த்தி செய்கிறார்.`,
          `உயர்தர செயல்பாட்டுத் தரங்களுடன் ${job?.locationName || 'நியமிக்கப்பட்ட இடத்தில்'} உடனடியாகப் பணியாற்றத் தயாராக உள்ளார்.`
        ],
        'Malayalam': [
          `${job?.title || 'ഈ ജോലി'}ക്ക് ആവശ്യമായ പ്രധാന കഴിവുകളുമായി പൊരുത്തപ്പെടുന്ന ${profile?.skills?.slice(0, 2).join(' കൂടാതെ ') || 'വ്യവസായ ജോലികളിൽ'} പരിചയസമ്പന്നൻ.`,
          `${job?.requirementsTags?.slice(0, 2).join(' അല്ലെങ്കിൽ ') || 'ശാരീരികക്ഷമതയും ആവശ്യമായ രേഖകളും'} ഉണ്ടെന്ന പ്രധാന നിബന്ധന പാലിക്കുന്നു.`,
          `ഉയർന്ന പ്രവർത്തന നിലവാരത്തോടെ ${job?.locationName || 'നിർദ്ദിഷ്ട സ്ഥലത്ത്'} ഉടനടി ജോലിയിൽ പ്രവേശിക്കാൻ സന്നദ്ധനാണ്.`
        ],
        'Hindi': [
          `${profile?.skills?.slice(0, 2).join(' और ') || 'औद्योगिक कार्यों'} में अनुभवी जो ${job?.title || 'इस भूमिका'} की मुख्य आवश्यकताओं से मेल खाता है।`,
          `${job?.requirementsTags?.slice(0, 2).join(' या ') || 'शारीरिक फिटनेस और उचित क्रेडेंशियल'} होने की मुख्य आवश्यकता को पूरा करता है।`,
          `उच्च परिचालन मानकों के साथ ${job?.locationName || 'नामित स्थान'} पर तुरंत तैनात होने के लिए तैयार।`
        ]
      };
      // CWE-94 fix: use safeLangLookup instead of direct bracket access
      return safeLangLookup(localBullets, selectedLanguage) || localBullets['English'];
    }
  }
};
