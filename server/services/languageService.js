/**
 * InGPT Language Service
 * Comprehensive language detection, 22 Indian 8th Schedule languages registry,
 * world language support, script detection, RTL handling, and capability reporting.
 */

// 22 Eighth Schedule Indian Languages + Major World Languages capability registry
export const LANGUAGE_REGISTRY = {
  // Indian 8th Schedule Languages
  as: { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali/Assamese', textChat: true, speechRecognition: true, voiceGeneration: 'partial', rtl: false },
  bn: { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  brx: { code: 'brx', name: 'Bodo', nativeName: 'बर’', script: 'Devanagari', textChat: true, speechRecognition: 'partial', voiceGeneration: 'partial', rtl: false },
  doi: { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', script: 'Devanagari', textChat: true, speechRecognition: 'partial', voiceGeneration: 'partial', rtl: false },
  gu: { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  kn: { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  ks: { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर / کٲشُر', script: 'Perso-Arabic/Devanagari', textChat: true, speechRecognition: 'partial', voiceGeneration: 'partial', rtl: true },
  kok: { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', script: 'Devanagari', textChat: true, speechRecognition: 'partial', voiceGeneration: 'partial', rtl: false },
  mai: { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', script: 'Devanagari', textChat: true, speechRecognition: 'partial', voiceGeneration: 'partial', rtl: false },
  ml: { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  mni: { code: 'mni', name: 'Manipuri (Meitei)', nativeName: 'মৈতৈলোন্ / ꯃꯤꯇꯩꯂꯣꯟ', script: 'Meitei Mayek/Bengali', textChat: true, speechRecognition: 'partial', voiceGeneration: 'partial', rtl: false },
  mr: { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  ne: { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', script: 'Devanagari', textChat: true, speechRecognition: true, voiceGeneration: 'partial', rtl: false },
  or: { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', textChat: true, speechRecognition: true, voiceGeneration: 'partial', rtl: false },
  pa: { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ / پنجابی', script: 'Gurmukhi/Shahmukhi', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  sa: { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Devanagari', textChat: true, speechRecognition: 'partial', voiceGeneration: 'partial', rtl: false },
  sat: { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'Ol Chiki', textChat: true, speechRecognition: 'partial', voiceGeneration: 'partial', rtl: false },
  sd: { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي / सिन्धी', script: 'Perso-Arabic/Devanagari', textChat: true, speechRecognition: 'partial', voiceGeneration: 'partial', rtl: true },
  ta: { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  te: { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  ur: { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'Perso-Arabic', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: true },

  // World Languages (Selection of major global languages)
  en: { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', script: 'Latin', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', script: 'Latin', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', script: 'Latin', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', script: 'Japanese', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  zh: { code: 'zh', name: 'Chinese (Mandarin)', nativeName: '中文', script: 'Han', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', script: 'Arabic', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: true },
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', script: 'Cyrillic', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', script: 'Latin', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', script: 'Latin', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  ko: { code: 'ko', name: 'Korean', nativeName: '한국어', script: 'Hangul', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', script: 'Latin', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  vi: { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', script: 'Latin', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  id: { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', script: 'Latin', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  fa: { code: 'fa', name: 'Persian', nativeName: 'فارسی', script: 'Perso-Arabic', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: true },
  he: { code: 'he', name: 'Hebrew', nativeName: 'עברית', script: 'Hebrew', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: true },
  nl: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', script: 'Latin', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  pl: { code: 'pl', name: 'Polish', nativeName: 'Polski', script: 'Latin', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false },
  uk: { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', script: 'Cyrillic', textChat: true, speechRecognition: true, voiceGeneration: true, rtl: false }
};

// Unicode regex ranges for accurate script classification
const SCRIPT_RANGES = [
  { name: 'Telugu', regex: /[\u0C00-\u0C7F]/g, code: 'te' },
  { name: 'Tamil', regex: /[\u0B80-\u0BFF]/g, code: 'ta' },
  { name: 'Kannada', regex: /[\u0C80-\u0CFF]/g, code: 'kn' },
  { name: 'Malayalam', regex: /[\u0D00-\u0D7F]/g, code: 'ml' },
  { name: 'Gujarati', regex: /[\u0A80-\u0AFF]/g, code: 'gu' },
  { name: 'Gurmukhi (Punjabi)', regex: /[\u0A00-\u0A7F]/g, code: 'pa' },
  { name: 'Odia', regex: /[\u0B00-\u0B7F]/g, code: 'or' },
  { name: 'Bengali/Assamese', regex: /[\u0980-\u09FF]/g, code: 'bn' },
  { name: 'Devanagari', regex: /[\u0900-\u097F]/g, code: 'hi' }, // Default Hindi/Marathi/Sanskrit/Nepali
  { name: 'Arabic/Perso-Arabic', regex: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, code: 'ur' },
  { name: 'Japanese', regex: /[\u3040-\u309F\u30A0-\u30FF]/g, code: 'ja' },
  { name: 'Chinese', regex: /[\u4E00-\u9FFF]/g, code: 'zh' },
  { name: 'Korean', regex: /[\uAC00-\uD7AF\u1100-\u11FF]/g, code: 'ko' },
  { name: 'Cyrillic', regex: /[\u0400-\u04FF]/g, code: 'ru' },
  { name: 'Hebrew', regex: /[\u0590-\u05FF]/g, code: 'he' },
  { name: 'Ol Chiki (Santali)', regex: /[\u1C50-\u1C7F]/g, code: 'sat' },
  { name: 'Meitei Mayek (Manipuri)', regex: /[\uABC0-\uABFF\uAAE0-\uAAFF]/g, code: 'mni' },
  { name: 'Thai', regex: /[\u0E00-\u0E7F]/g, code: 'th' }
];

/**
 * Detect script and primary language from text content.
 * Returns language code, name, and script metadata.
 */
export function detectLanguage(text = '') {
  if (!text || typeof text !== 'string') {
    return { ...LANGUAGE_REGISTRY.en, confidence: 1.0, detectedScript: 'Latin' };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { ...LANGUAGE_REGISTRY.en, confidence: 1.0, detectedScript: 'Latin' };
  }

  // Check Unicode script matches
  for (const script of SCRIPT_RANGES) {
    const matches = trimmed.match(script.regex);
    if (matches && matches.length >= 1) {
      // Script matched
      const lang = LANGUAGE_REGISTRY[script.code] || {
        code: script.code,
        name: script.name,
        nativeName: script.name,
        script: script.name,
        textChat: true,
        speechRecognition: 'partial',
        voiceGeneration: 'partial',
        rtl: script.name.includes('Arabic') || script.name.includes('Hebrew')
      };
      return {
        ...lang,
        confidence: Math.min(1.0, matches.length / Math.max(1, trimmed.length)),
        detectedScript: script.name
      };
    }
  }

  // Latin-script heuristic analysis (English, Spanish, French, German, or Transliterated Indian like Hinglish/Tanglish)
  const lower = trimmed.toLowerCase();

  // Common Hindi/Indian transliterations (Hinglish/Tanglish/Teluglish)
  if (/\b(namaste|kaise|kya|kyun|haan|nahi|theek|bhai|aap|mujhe|tum|mera|meri|karo|batao|dhanyawad|shukriya|vanakkam|eppadi|irukkeenga|namaskaram|ela|unnaru|bagunnara|cheppandi)\b/i.test(lower)) {
    return {
      code: 'hi-Latn',
      name: 'Hindi (Latin / Hinglish)',
      nativeName: 'Hinglish / हिंदी (रोमन)',
      script: 'Latin (Transliterated)',
      textChat: true,
      speechRecognition: true,
      voiceGeneration: true,
      rtl: false,
      confidence: 0.85,
      detectedScript: 'Latin'
    };
  }

  // Spanish indicators
  if (/\b(hola|cómo|estas|gracias|buenos|días|por favor|amigo|donde|está)\b/i.test(lower)) {
    return { ...LANGUAGE_REGISTRY.es, confidence: 0.9, detectedScript: 'Latin' };
  }

  // French indicators
  if (/\b(bonjour|merci|salut|comment|allez|vous|oui|non|s'il vous plaît)\b/i.test(lower)) {
    return { ...LANGUAGE_REGISTRY.fr, confidence: 0.9, detectedScript: 'Latin' };
  }

  // German indicators
  if (/\b(hallo|guten|tag|danke|bitte|wie|geht|nicht|deutsch)\b/i.test(lower)) {
    return { ...LANGUAGE_REGISTRY.de, confidence: 0.9, detectedScript: 'Latin' };
  }

  // Default to English with Latin script
  return {
    ...LANGUAGE_REGISTRY.en,
    confidence: 0.9,
    detectedScript: 'Latin'
  };
}

/**
 * Checks if a language is Right-to-Left (RTL)
 */
export function isRTL(langCode = '') {
  const code = (langCode || '').split('-')[0].toLowerCase();
  const lang = LANGUAGE_REGISTRY[code];
  if (lang && typeof lang.rtl === 'boolean') return lang.rtl;
  return ['ar', 'ur', 'he', 'fa', 'ks', 'sd', 'ps', 'yi'].includes(code);
}

/**
 * Build system prompt guidelines for multi-language conversation
 */
export function getLanguageSystemPrompt(activeLanguage = null) {
  return `You are InGPT, a calm, intelligent, and warm conversational AI assistant.
Your tagline is: "Your AI. Your Voice. Your Conversation."

CRITICAL LANGUAGE GUIDELINES:
1. ALWAYS identify the language and script of the user's message.
2. Respond NATURALLY and FLUENTLY in that EXACT SAME language and script.
3. If the user speaks or writes in Telugu, respond in Telugu script (తెలుగు).
4. If the user speaks or writes in Hindi, respond in Devanagari script (हिन्दी).
5. If the user writes in Tamil (தமிழ்), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), Bengali (বাংলা), Gujarati (ગુજરાતી), Marathi (मराठी), Punjabi (ਪੰਜਾਬੀ), Odia (ଓଡ଼ିଆ), Assamese (অসমীয়া), Urdu (اردو), or any of the 22 Indian 8th Schedule languages or world languages, respond in that authentic language and script.
6. If the user writes in Roman transliteration (e.g. Hinglish "Aap kaise ho?", Tanglish, or Teluglish "Meeru ela unnaru?"), respond in natural, friendly matching Roman transliteration with optional authentic script.
7. Seamlessly handle language switching when the user changes language midway.
8. NEVER force English on the user. Never ask "Would you like me to translate this to English?".
9. Keep answers concise, spoken-friendly, clear, and engaging. Avoid robotic bulleted walls of text unless the user specifically asks for detailed notes or code.`;
}
