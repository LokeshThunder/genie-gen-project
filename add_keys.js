import fs from 'fs';
import { LANGUAGES, TRANSLATIONS } from './src/constants/translations.js';

const newTranslations = {
  "ready_next_gig": {
    "English": "Ready for your next gig?",
    "Hindi": "क्या आप अपने अगले काम के लिए तैयार हैं?",
    "Bengali": "আপনার পরবর্তী কাজের জন্য প্রস্তুত?",
    "Marathi": "तुमच्या पुढील कामासाठी तयार आहात का?",
    "Telugu": "మీ తదుపరి పనికి సిద్ధంగా ఉన్నారా?",
    "Tamil": "உங்கள் அடுத்த வேலைக்குத் தயாரா?",
    "Gujarati": "તમારા આગામી કામ માટે તૈયાર છો?",
    "Urdu": "کیا آپ اپنے اگلے کام کے لیے تیار ہیں؟",
    "Kannada": "ನಿಮ್ಮ ಮುಂದಿನ ಕೆಲಸಕ್ಕೆ ಸಿದ್ಧರಿದ್ದೀರಾ?",
    "Odia": "ଆପଣଙ୍କର ପରବର୍ତ୍ତୀ କାମ ପାଇଁ ପ୍ରସ୍ତୁତ କି?",
    "Malayalam": "നിങ്ങളുടെ അടുത്ത ജോലിക്കായി തയ്യാറാണോ?"
  },
  "skills_in_demand": {
    "English": "Your skills are in demand today",
    "Hindi": "आपके कौशल की आज भारी मांग है",
    "Bengali": "আপনার দক্ষতা আজ খুব চাহিদাপূর্ণ",
    "Marathi": "तुमच्या कौशल्यांना आज मागणी आहे",
    "Telugu": "ఈరోజు మీ నైపుణ్యాలకు మంచి డిమాండ్ ఉంది",
    "Tamil": "உங்கள் திறமைகளுக்கு இன்று நல்ல வரவேற்பு உள்ளது",
    "Gujarati": "તમારા કૌશલ્યોની આજે ખૂબ માંગ છે",
    "Urdu": "آج آپ کی مہارتوں کی مانگ ہے",
    "Kannada": "ನಿಮ್ಮ ಕೌಶಲ್ಯಗಳಿಗೆ ಇಂದು ಹೆಚ್ಚಿನ ಬೇಡಿಕೆಯಿದೆ",
    "Odia": "ଆଜି ଆପଣଙ୍କ ଦକ୍ଷତାର ବହుତ ଚାହିଦา ଅଛି",
    "Malayalam": "നിങ്ങളുടെ കഴിവുകൾക്ക് ഇന്ന് വലിയ ഡിമാൻഡ് ഉണ്ട്"
  },
  "browse": {
    "English": "Browse",
    "Hindi": "खोजें",
    "Bengali": "ব্রাউজ করুন",
    "Marathi": "शोधा",
    "Telugu": "బ్రౌజ్ చేయండి",
    "Tamil": "தேடவும்",
    "Gujarati": "શોધો",
    "Urdu": "براؤز کریں",
    "Kannada": "ಹುಡುಕಿ",
    "Odia": "ଖୋଜନ୍ତୁ",
    "Malayalam": "തിരയുക"
  },
  "applied_label": {
    "English": "Applied",
    "Hindi": "लागू किया गया",
    "Bengali": "আবেদন করা হয়েছে",
    "Marathi": "अर्ज केला",
    "Telugu": "దరఖాస్తు చేసారు",
    "Tamil": "விண்ணப்பிக்கப்பட்டது",
    "Gujarati": "અરજી કરી",
    "Urdu": "درخواست دی گئی",
    "Kannada": "ಅರ್ಜಿ ಸಲ್ಲಿಸಲಾಗಿದೆ",
    "Odia": "ଆବେଦନ କରାଯାଇଛି",
    "Malayalam": "അപേക്ഷിച്ചു"
  },
  "active_label": {
    "English": "Active",
    "Hindi": "सक्रिय",
    "Bengali": "সক্রিয়",
    "Marathi": "सक्रिय",
    "Telugu": "సక్రియంగా ఉంది",
    "Tamil": "செயலில் உள்ளது",
    "Gujarati": "સક્રિય",
    "Urdu": "سرگرم",
    "Kannada": "ಸಕ್ರಿಯ",
    "Odia": "ସକ୍ରିୟ",
    "Malayalam": "സജീവം"
  },
  "completed_label": {
    "English": "Completed",
    "Hindi": "पूरा हुआ",
    "Bengali": "সম্পন্ন",
    "Marathi": "पूर्ण झाले",
    "Telugu": "పూర్తయింది",
    "Tamil": "முடிந்தது",
    "Gujarati": "પૂર્ણ થયું",
    "Urdu": "مکمل",
    "Kannada": "ಪೂರ್ಣಗೊಂಡಿದೆ",
    "Odia": "ସମ୍ପୂର୍ଣ୍ଣ ହେଲା",
    "Malayalam": "പൂർത്തിയായി"
  },
  "genie_loans": {
    "English": "⚡ GENIE LOANS",
    "Hindi": "⚡ जिनी ऋण",
    "Bengali": "⚡ জিনী লোন",
    "Marathi": "⚡ जिनी कर्ज",
    "Telugu": "⚡ జిని రుణాలు",
    "Tamil": "⚡ ஜினி கடன்கள்",
    "Gujarati": "⚡ જીની लोन",
    "Urdu": "⚡ جینی لون",
    "Kannada": "⚡ ಜಿನಿ ಸಾಲಗಳು",
    "Odia": "⚡ ଜିନି ଋଣ",
    "Malayalam": "⚡ ജിനി വായ്പകൾ"
  },
  "instant_loans": {
    "English": "Instant Cash — Up to ₹1,00,000",
    "Hindi": "तुरंत नकद — ₹1,00,000 तक",
    "Bengali": "তাত্ক্ষণিক ক্যাশ — ₹১,০০,০০০ পর্যন্ত",
    "Marathi": "तात्काळ रोख — ₹१,००,००० पर्यंत",
    "Telugu": "తక్షణ నగదు — ₹1,00,000 వరకు",
    "Tamil": "உடனடி ரொக்கம் — ₹1,00,000 வரை",
    "Gujarati": "ઇન્સ્ટન્ટ કેશ — ₹1,00,000 સુધી",
    "Urdu": "فوری نقد — 1,00,000 روپے तक",
    "Kannada": "തൽക്ഷണ പണം — ₹1,00,000 വരെ",
    "Odia": "ତତ୍କାଳ ନଗଦ — ₹୧,୦୦,୦୦୦ ପର୍ଯ୍ୟନ୍ତ",
    "Malayalam": "തൽക്ഷണ പണം — ₹1,00,000 വരെ"
  },
  "zero_fee_desc": {
    "English": "Zero fee · Apply in 2 minutes →",
    "Hindi": "शून्य शुल्क · 2 मिनट में आवेदन करें →",
    "Bengali": "শূন্য ফি · ২ মিনিটে আবেদন করুন →",
    "Marathi": "शून्य शुल्क · २ मिनिटात अर्ज करा →",
    "Telugu": "సున్నా రుసుము · 2 నిమిషాల్లో దరఖాస్తు చేసుకోండి →",
    "Tamil": "பூஜ்ஜிய கட்டணம் · 2 நிமிடங்களில் விண்ணப்பிக்கவும் →",
    "Gujarati": "શૂન્ય ફી · 2 મિનિટમાં અરજી કરો →",
    "Urdu": "زیرو فیس · 2 منٹ میں درخواست دیں →",
    "Kannada": "ಶೂನ್ಯ ಶುಲ್ಕ · 2 ನಿಮಿಷದಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ →",
    "Odia": "ଶୂନ୍ୟ ଫି · ୨ ମିନିଟରେ ଆବେଦନ କରନ୍ତୁ →",
    "Malayalam": "പൂജ്യം ഫീസ് · 2 മിനിറ്റിൽ അപേക്ഷിക്കുക →"
  },
  "health_accident_insurance": {
    "English": "Health & Accident Insurance",
    "Hindi": "स्वास्थ्य और दुर्घटना बीमा",
    "Bengali": "স্বাস্থ্য ও দুর্ঘটনা বীমা",
    "Marathi": "आरोग्य आणि अपघात विमा",
    "Telugu": "ఆరోగ్య మరియు ప్రమాద భీమా",
    "Tamil": "சுகாதார மற்றும் விபத்து காப்பீடு",
    "Gujarati": "આરોગ્ય અને અકસ્માત વીમો",
    "Urdu": "صحت اور حادثاتی انشورنس",
    "Kannada": "ಆರೋಗ್ಯ ಮತ್ತು ಅಪಘಾತ ವಿಮೆ",
    "Odia": "ସ୍ୱାସ୍ଥ୍ୟ ଏବଂ ଦୁର୍ଘଟଣା ବୀମା",
    "Malayalam": "ആരോഗ്യ സുരക്ഷാ ഇൻഷുറൻസ്"
  },
  "live_tracking_active": {
    "English": "Live tracking active",
    "Hindi": "लाइव ट्रैकिंग सक्रिय है",
    "Bengali": "লাইভ ট্র্যাকিং সক্রিয় আছে",
    "Marathi": "लाइव ट्रॅकिंग सुरू आहे",
    "Telugu": "లైవ్ ట్రాకింగ్ సక్రియంగా ఉంది",
    "Tamil": "நேரடி கண்காணிப்பு செயல்பாட்டில் உள்ளது",
    "Gujarati": "લાઇવ ટ્રેકિંગ सક્રિય છે",
    "Urdu": "لائیو ٹریکنگ فعال ہے",
    "Kannada": "ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಸಕ್ರಿಯವಾಗಿದೆ",
    "Odia": "ଲାଇଭ୍ ଟ୍ରାକିଂ ସକ୍ରିୟ ଅଛି",
    "Malayalam": "തത്സമയ ട്രാക്കിംഗ് സജീവമാണ്"
  },
  "protect_journey": {
    "English": "Protect your journey",
    "Hindi": "अपनी यात्रा को सुरक्षित रखें",
    "Bengali": "আপনার যাত্রা সুরক্ষিত রাখুন",
    "Marathi": "तुमचा प्रवास सुरक्षित करा",
    "Telugu": "మీ ప్రయాణాన్ని రక్షించుకోండి",
    "Tamil": "உங்கள் பயணத்தைப் பாதுகாக்கவும்",
    "Gujarati": "તમારી મુસાફરી સુરક્ષિત કરો",
    "Urdu": "اپنے سفر کی حفاظت کریں",
    "Kannada": "ನಿಮ್ಮ ಪ್ರಯಾಣವನ್ನು ರಕ್ಷಿಸಿ",
    "Odia": "ଆପଣଙ୍କ ଯାତ୍ରାକୁ ସୁରକ୍ଷିତ ରଖନ୍ତୁ",
    "Malayalam": "നിങ്ങളുടെ യാത്ര സുരക്ഷിതമാക്കൂ"
  },
  "explore": {
    "English": "Explore",
    "Hindi": "एक्सप्लोर करें",
    "Bengali": "এক্সপ্লোর করুন",
    "Marathi": "अन्वेषण करा",
    "Telugu": "అన్వేషించండి",
    "Tamil": "ஆராயுங்கள்",
    "Gujarati": "એક્સપ્લોર કરો",
    "Urdu": "تلاش کریں",
    "Kannada": "ಅನ್ವೇಷಿಸಿ",
    "Odia": "ଅନୁସନ୍ଧାନ କରନ୍ତୁ",
    "Malayalam": "പര്യവേക്ഷണം"
  },
  "leaderboard": {
    "English": "Leaderboard",
    "Hindi": "लीडरबोर्ड",
    "Bengali": "লিডারবোর্ড",
    "Marathi": "लीडरबोर्ड",
    "Telugu": "లీడర్‌బోర్డ్",
    "Tamil": "லீடர்போர்டு",
    "Gujarati": "લીડરબોર્ડ",
    "Urdu": "لیڈر بورڈ",
    "Kannada": "ಲೀಡರ್‌ಬೋರ್ಡ್",
    "Odia": "ଲିଡରବୋର୍ଡ",
    "Malayalam": "ಲೀഡർബോർഡ്"
  },
  "see_top_earners": {
    "English": "See top earners",
    "Hindi": "शीर्ष कमाई करने वाले देखें",
    "Bengali": "সেরা উপার্জনকারী দেখুন",
    "Marathi": "अव्वल कमाई करणारे पहा",
    "Telugu": "అत्यధికంగా సంपादించే వారిని చూడండి",
    "Tamil": "அதிகம் சம்பாதிப்பவர்களைப் பார்க்கவும்",
    "Gujarati": "ટોચના કમાણી કરનારા જુઓ",
    "Urdu": "سب سے زیادہ کمانے والے دیکھیں",
    "Kannada": "ಹೆಚ್ಚು ಗಳಿಸುವವರನ್ನು ನೋಡಿ",
    "Odia": "ସର୍ବାଧିକ ରୋଜଗାରକାରୀଙ୍କୁ ଦେଖନ୍ତୁ",
    "Malayalam": "കൂടുതൽ സമ്പാദിക്കുന്നവരെ കാണുക"
  },
  "skill_tree": {
    "English": "Skill Tree",
    "Hindi": "कौशल वृक्ष",
    "Bengali": "দক্ষতা বৃক্ষ",
    "Marathi": "कौशल्य वृक्ष",
    "Telugu": "నైపుణ్యాల వృక్షం",
    "Tamil": "திறன் மரம்",
    "Gujarati": "કૌશલ્ય વૃક્ષ",
    "Urdu": "مہارت کا درخت",
    "Kannada": "ಕೌಶಲ್ಯ ವೃಕ್ಷ",
    "Odia": "ଦକ୍ଷତା ବୃକ୍ଷ",
    "Malayalam": "സ്കിൽ ട്രീ"
  },
  "grow_career": {
    "English": "Grow your career",
    "Hindi": "अपना करियर बढ़ाएं",
    "Bengali": "আপনার ক্যারিয়ার গড়ুন",
    "Marathi": "तुमचे करिअर वाढवा",
    "Telugu": "మీ కెరీర్‌ను వృద్ధి చేసుకోండి",
    "Tamil": "உங்கள் வாழ்க்கையை வளர்த்துக் கொள்ளுங்கள்",
    "Gujarati": "તમારી કારકिર્દીનો વિકાસ કરો",
    "Urdu": "اپنا کیریئر بڑھائیں",
    "Kannada": "ನಿಮ್ಮ ವೃತ್ತಿಜೀವನವನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳಿ",
    "Odia": "ଆପଣଙ୍କ କ୍ୟାରିୟରକୁ ବୃଦ୍ଧି କରନ୍ତୁ",
    "Malayalam": "നിങ്ങളുടെ കരിയർ വളർത്തുക"
  },
  "future_of_work_tagline": {
    "English": "The Future of Work · Job Genie",
    "Hindi": "काम का भविष्य · जॉब जिनी",
    "Bengali": "কাজের ভবিষ্যৎ · জব জিনী",
    "Marathi": "कामाचे भविष्य · जॉब जिनी",
    "Telugu": "పని యొక్క భవిష్యత్ · జాబ్ జిని",
    "Tamil": "வேலையின் எதிர்காலம் · ஜாப் ஜினி",
    "Gujarati": "કામનું ભવિષ્ય · જોબ જીની",
    "Urdu": "کام کا مستقبل · جاب جینی",
    "Kannada": "ಕೆಲಸದ ಭವಿಷ್ಯ · ಜಾಬ್ ಜಿನಿ",
    "Odia": "କାର୍ଯ୍ୟର ଭବିଷ୍ୟତ · ଜବ୍ ଜିନି",
    "Malayalam": "തൊഴിലിൻ്റെ ഭാവി · ജോബ് ജിനി"
  }
};

// Inject keys
Object.keys(TRANSLATIONS).forEach(lang => {
  Object.keys(newTranslations).forEach(key => {
    if (newTranslations[key][lang]) {
      TRANSLATIONS[lang][key] = newTranslations[key][lang];
    } else {
      // fallback to English
      TRANSLATIONS[lang][key] = newTranslations[key]["English"];
    }
  });
});

const output = `export const LANGUAGES = ${JSON.stringify(LANGUAGES, null, 2)};

export const TRANSLATIONS = ${JSON.stringify(TRANSLATIONS, null, 2)};
`;

fs.writeFileSync('./src/constants/translations.js', output, 'utf8');
console.log("Injected all 18 keys successfully!");
