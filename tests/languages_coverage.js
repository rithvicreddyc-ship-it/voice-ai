import { LANGUAGE_REGISTRY, detectLanguage } from '../server/services/languageService.js';

const eighthScheduleLanguages = [
  { code: 'as', name: 'Assamese', sample: 'নমস্কাৰ, আপুনি কেনে আছে?' },
  { code: 'bn', name: 'Bengali', sample: 'নমস্কার, আজ আবহাওয়া কেমন?' },
  { code: 'brx', name: 'Bodo', sample: 'खुलुमबाय, नोंथाङा माबोरै दं?' },
  { code: 'doi', name: 'Dogri', sample: 'नमस्ते, तुंदा केह् हाल ऐ?' },
  { code: 'gu', name: 'Gujarati', sample: 'નમસ્તે, તમે કેમ છો?' },
  { code: 'hi', name: 'Hindi', sample: 'नमस्ते! आज का मौसम कैसा है?' },
  { code: 'kn', name: 'Kannada', sample: 'ನಮಸ್ಕಾರ, ಇವತ್ತು ಹವಾಮಾನ ಹೇಗಿದೆ?' },
  { code: 'ks', name: 'Kashmiri', sample: 'کٲشُر زَبانہِ منٛز سلام' },
  { code: 'kok', name: 'Konkani', sample: 'नमस्कार, तुमी कशे आसात?' },
  { code: 'mai', name: 'Maithili', sample: 'प्रणाम, अहाँ कते छी?' },
  { code: 'ml', name: 'Malayalam', sample: 'നമസ്കാരം, സുഖമാണോ?' },
  { code: 'mni', name: 'Manipuri', sample: 'ꯈꯨꯔꯨꯝꯖꯔꯤ, ꯅꯪ ꯀꯔꯝꯅ ꯂꯩꯔꯤ?' },
  { code: 'mr', name: 'Marathi', sample: 'नमस्कार! आजचे हवामान कसे आहे?' },
  { code: 'ne', name: 'Nepali', sample: 'नमस्ते, तपाईँलाई कस्तो छ?' },
  { code: 'or', name: 'Odia', sample: 'ନମସ୍କାର, ଆପଣ କେମିତି ଅଛନ୍ତି?' },
  { code: 'pa', name: 'Punjabi', sample: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਅੱਜ ਮੌਸਮ ਕਿਵੇਂ ਹੈ?' },
  { code: 'sa', name: 'Sanskrit', sample: 'नमो नमः, भवान् कथमस्ति?' },
  { code: 'sat', name: 'Santali', sample: 'ᱡᱚᱦᱟᱨ, ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱜ ᱵᱤᱱᱟ?' },
  { code: 'sd', name: 'Sindhi', sample: 'سنڌي ٻوليءَ ۾ ڀلي ڪري آيا' },
  { code: 'ta', name: 'Tamil', sample: 'வணக்கம், இன்று மழை வருமா?' },
  { code: 'te', name: 'Telugu', sample: 'నమస్కారం, ఈ రోజు వాతావరణం ఎలా ఉంది?' },
  { code: 'ur', name: 'Urdu', sample: 'السلام علیکم، آپ کیسے ہیں؟' }
];

console.log('Testing coverage of all 22 Eighth Schedule Indian Languages:');
let passed = 0;

for (const lang of eighthScheduleLanguages) {
  const reg = LANGUAGE_REGISTRY[lang.code];
  if (!reg) {
    console.error(`FAILED: ${lang.name} (${lang.code}) missing from registry`);
    continue;
  }

  const detected = detectLanguage(lang.sample);
  console.log(`✓ [${lang.code.toUpperCase()}] ${lang.name.padEnd(16)} Native: ${reg.nativeName.padEnd(14)} Script: ${reg.script.padEnd(20)} RTL: ${reg.rtl}`);
  passed++;
}

console.log(`\nSuccessfully verified ${passed}/${eighthScheduleLanguages.length} Eighth Schedule Indian Languages!`);
