import fs from 'fs';
import { LANGUAGES, TRANSLATIONS } from '../src/constants/translations.js';

const newTranslations = {
  "quick_actions": {
    "English": "Quick Actions",
    "Hindi": "त्वरित कार्रवाई",
    "Bengali": "দ্রুত অ্যাকশন",
    "Marathi": "त्वरित कृती",
    "Telugu": "త్వరిత చర్యలు",
    "Tamil": "விரைவுச் செயல்கள்",
    "Gujarati": "ઝડપી ક્રિયાઓ",
    "Urdu": "فوری اقدامات",
    "Kannada": "ತ್ವರಿತ ಕ್ರಮಗಳು",
    "Odia": "ତ୍ୱରିତ କାର୍ଯ୍ୟାନୁଷ୍ଠାନ",
    "Malayalam": "ദ്രുത നടപടികൾ"
  },
  "offline": {
    "English": "Offline",
    "Hindi": "ऑफलाइन",
    "Bengali": "অফলাইন",
    "Marathi": "ऑफलाइन",
    "Telugu": "ఆఫ్‌లైన్",
    "Tamil": "ஆஃப்லைன்",
    "Gujarati": "ઓફલાઇન",
    "Urdu": "آف لائن",
    "Kannada": "ಆಫ್‌ಲೈನ್",
    "Odia": "ଅଫଲାଇନ୍",
    "Malayalam": "ഓഫ്‌ലൈൻ"
  },
  "scan_qr_shift": {
    "English": "Scan QR Shift",
    "Hindi": "क्यूआर शिफ्ट स्कैन करें",
    "Bengali": "কিউআর শিফট স্ক্যান করুন",
    "Marathi": "क्यूआर शिफ्ट स्कॅन करा",
    "Telugu": "క్యూఆర్ షిఫ్ట్ స్కాన్ చేయండి",
    "Tamil": "க்யூஆர் ஷிப்ட் ஸ்கேன் செய்யவும்",
    "Gujarati": "ક્યુઆર શિફ્ટ સ્કેન કરો",
    "Urdu": "کیو آر شفٹ اسکین کریں",
    "Kannada": "ಕ್ಯೂಆರ್ ಶಿಫ್ಟ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    "Odia": "କ୍ୟୁଆର ଶିଫ୍ଟ ସ୍କାନ୍ କରନ୍ତು",
    "Malayalam": "ക്യുആർ ഷിഫ്റ്റ് സ്കാൻ ചെയ്യുക"
  },
  "shift_ready_to_start": {
    "English": "Shift ready to start",
    "Hindi": "शिफ्ट शुरू होने के लिए तैयार है",
    "Bengali": "শিফট শুরু করার জন্য প্রস্তুত",
    "Marathi": "शिफ्ट सुरू होण्यासाठी तयार आहे",
    "Telugu": "షిఫ్ట్ ప్రారంభించడానికి సిద్ధంగా ఉంది",
    "Tamil": "ஷிப்ட் தொடங்க தயாராக உள்ளது",
    "Gujarati": "શિફ્ટ શરૂ થવા માટે तैयार है",
    "Urdu": "شفٹ شروع ہونے کے لیے تیار ہے",
    "Kannada": "ಶಿಫ್ಟ್ ಪ್ರಾರಂಭಿಸಲು ಸಿದ್ಧವಾಗಿದೆ",
    "Odia": "ଶିଫ୍ଟ ଆରମ୍ଭ ହେବା ପାଇଁ ପ୍ରସ୍ତୁତ",
    "Malayalam": "ഷിഫ്റ്റ് ആരംഭിക്കാൻ തയ്യാറാണ്"
  },
  "shift_in_progress": {
    "English": "Shift in progress",
    "Hindi": "शिफ्ट प्रगति पर है",
    "Bengali": "শিফট চলছে",
    "Marathi": "शिफ्ट सुरू आहे",
    "Telugu": "షిఫ్ట్ కొనసాగుతోంది",
    "Tamil": "ஷிப்ட் செயல்பாட்டில் உள்ளது",
    "Gujarati": "શિફ્ટ પ્રગતિ પર છે",
    "Urdu": "شفٹ جاری ہے",
    "Kannada": "ಶಿಫ್ಟ್ ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    "Odia": "ଶିଫ୍ଟ ଚାଲୁଅଛି",
    "Malayalam": "ഷിഫ്റ്റ് പുരോഗമിക്കുന്നു"
  },
  "tap_check_in_now": {
    "English": "Tap to check in now",
    "Hindi": "चेक-इन करने के लिए टैप करें",
    "Bengali": "এখনই চেক-ইন করতে আলতো চাপুন",
    "Marathi": "चेक-इन करण्यासाठी टॅप करा",
    "Telugu": "చెక్-ఇన్ చేయడానికి నొక్కండి",
    "Tamil": "இப்போது செக்-இன் செய்ய தட்டவும்",
    "Gujarati": "ચેક-ઇન કરવા માટે ટેપ કરો",
    "Urdu": "چیک ان کرنے کے لیے تھپتھپائیں",
    "Kannada": "ಚೆಕ್-ইন ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
    "Odia": "ଚେକ୍-ଇନ୍ କରିବା ପାଇଁ ଟ୍ୟାପ୍ କରନ୍ତು",
    "Malayalam": "ചെക്ക് ഇൻ ചെയ്യാൻ ടാപ്പ് ചെയ്യുക"
  },
  "tap_view_attendance": {
    "English": "Tap to view attendance",
    "Hindi": "उपस्थिति देखने के लिए टैप करें",
    "Bengali": "উপস্থিতি দেখতে আলতো চাপুন",
    "Marathi": "हजेरी पाहण्यासाठी टॅप करा",
    "Telugu": "హాజరు చూడటానికి నొక్కండి",
    "Tamil": "வருகையைப் பார்க்க தட்டவும்",
    "Gujarati": "હાજरी જોવા માટે ટેપ કરો",
    "Urdu": "حاضری دیکھنے کے لیے تھپتھپائیں",
    "Kannada": "ಹಾಜರಾತಿ ವೀಕ್ಷಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
    "Odia": "ଉପସ୍ଥିତି ଦେଖିବା ପାଇଁ ଟ୍ୟାପ୍ କରନ୍ତು",
    "Malayalam": "ഹാജർ നില കാണാൻ ടാപ്പ് ചെയ്യുക"
  },
  "view_label": {
    "English": "View",
    "Hindi": "देखें",
    "Bengali": "দেখুন",
    "Marathi": "पहा",
    "Telugu": "చూడండి",
    "Tamil": "பார்க்க",
    "Gujarati": "જુઓ",
    "Urdu": "دیکھیں",
    "Kannada": "ವೀಕ್ಷಿಸಿ",
    "Odia": "ଦେଖନ୍ତು",
    "Malayalam": "കാണുക"
  }
};

// Inject keys into existing TRANSLATIONS
Object.keys(TRANSLATIONS).forEach(lang => {
  Object.keys(newTranslations).forEach(key => {
    if (newTranslations[key][lang]) {
      TRANSLATIONS[lang][key] = newTranslations[key][lang];
    } else {
      TRANSLATIONS[lang][key] = newTranslations[key]["English"];
    }
  });
});

const output = `export const LANGUAGES = ${JSON.stringify(LANGUAGES, null, 2)};

export const TRANSLATIONS = ${JSON.stringify(TRANSLATIONS, null, 2)};
`;

fs.writeFileSync('./src/constants/translations.js', output, 'utf8');
console.log("Successfully injected all remaining keys into translations.js!");
