/**
 * InGPT AI Service
 * Multi-turn text chat, language adaptation, tool execution (weather, search, time),
 * and graceful fallback when API credentials are not yet supplied.
 */

import { detectLanguage, getLanguageSystemPrompt, isRTL } from './languageService.js';
import { getWeather } from './weatherService.js';
import { searchWeb } from './searchService.js';

const TOOLS_DEFINITION = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get real-time live weather and temperature for any city or location in the world.',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'The city or location name, e.g. "Hyderabad", "Tokyo", "London"' }
        },
        required: ['location']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_web',
      description: 'Search the web for up-to-date facts, current information, summaries, and definitions.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search term or query' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_current_time',
      description: 'Get the current local date, time, and timezone.',
      parameters: {
        type: 'object',
        properties: {
          timezone: { type: 'string', description: 'Optional IANA timezone like "Asia/Kolkata", "UTC", "America/New_York"' }
        }
      }
    }
  }
];

export async function processChat({ message, history = [], options = {} }) {
  const userText = (message || '').trim();
  if (!userText) {
    return { error: true, message: 'Message cannot be empty.' };
  }

  // 1. Detect language & script
  const detected = detectLanguage(userText);
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';

  // 2. If OpenAI API key is present, use OpenAI Chat Completions API with tools
  if (apiKey && apiKey.trim() !== '') {
    try {
      const messages = [
        { role: 'system', content: getLanguageSystemPrompt(detected.code) },
        ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userText }
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          tools: TOOLS_DEFINITION,
          tool_choice: 'auto',
          temperature: 0.7
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('OpenAI API error:', res.status, errText);
        throw new Error(`OpenAI API returned status ${res.status}`);
      }

      const data = await res.json();
      const choice = data.choices[0];
      const replyMessage = choice.message;

      // Handle tool calling if requested by model
      if (replyMessage.tool_calls && replyMessage.tool_calls.length > 0) {
        const toolMessages = [...messages, replyMessage];

        for (const toolCall of replyMessage.tool_calls) {
          const fnName = toolCall.function.name;
          let args = {};
          try { args = JSON.parse(toolCall.function.arguments || '{}'); } catch (_) {}

          let toolResult = null;
          if (fnName === 'get_weather') {
            toolResult = await getWeather(args.location);
          } else if (fnName === 'search_web') {
            toolResult = await searchWeb(args.query);
          } else if (fnName === 'get_current_time') {
            toolResult = {
              currentDateTime: new Date().toLocaleString('en-US', { timeZone: args.timezone || 'UTC' }),
              iso: new Date().toISOString()
            };
          }

          toolMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult)
          });
        }

        // Second pass with tool response
        const secondRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages: toolMessages,
            temperature: 0.7
          }),
          signal: AbortSignal.timeout(15000)
        });

        if (secondRes.ok) {
          const secondData = await secondRes.json();
          const finalContent = secondData.choices[0].message.content;
          return {
            reply: finalContent,
            language: detected,
            isRTL: isRTL(detected.code),
            modelUsed: model,
            provider: 'openai'
          };
        }
      }

      return {
        reply: replyMessage.content,
        language: detected,
        isRTL: isRTL(detected.code),
        modelUsed: model,
        provider: 'openai'
      };
    } catch (err) {
      console.warn('OpenAI request failed, falling back to local conversational response:', err.message);
      // Fallback to intelligent local response below
    }
  }

  // 3. Built-in intelligent conversational fallback (no API key or network fallback)
  const localReply = await generateIntelligentFallback(userText, detected);

  return {
    reply: localReply.text,
    language: detected,
    isRTL: isRTL(detected.code),
    toolUsed: localReply.toolUsed || null,
    modelUsed: 'ingpt-local-engine',
    provider: 'local-fallback'
  };
}

/**
 * Intelligent local conversational assistant with live tools and multilingual adaptation
 */
async function generateIntelligentFallback(text, language) {
  const lower = text.toLowerCase();

  // 1. Live Weather Check
  const weatherMatch = lower.match(/(?:weather|temperature|forecast|climate|mausam|havamana|kalam)\s+(?:in|at|of|for)?\s*([a-zA-Z\s]+)/i);
  if (weatherMatch && weatherMatch[1]) {
    const loc = weatherMatch[1].trim();
    const weather = await getWeather(loc);
    if (!weather.error) {
      if (language.code === 'te') {
        return { text: `${weather.location} లో ప్రస్తుత ఉష్ణోగ్రత ${weather.temperature}. వాతావరణం: ${weather.condition}, తేమ: ${weather.humidity}, గాలి వేగం: ${weather.windSpeed}.`, toolUsed: 'weather' };
      }
      if (language.code === 'hi') {
        return { text: `${weather.location} में वर्तमान तापमान ${weather.temperature} है। स्थिति: ${weather.condition}, आर्द्रता: ${weather.humidity}, हवा की गति: ${weather.windSpeed}।`, toolUsed: 'weather' };
      }
      if (language.code === 'ta') {
        return { text: `${weather.location} இல் தற்போதைய வெப்பநிலை ${weather.temperature}. வானிலை: ${weather.condition}, ஈரப்பதம்: ${weather.humidity}.`, toolUsed: 'weather' };
      }
      return { text: `The current weather in ${weather.location} is ${weather.condition} with a temperature of ${weather.temperature} (feels like ${weather.feelsLike}). Humidity is ${weather.humidity} with winds at ${weather.windSpeed}.`, toolUsed: 'weather' };
    }
  }

  // 2. Real-time Search or Definition Check
  const searchMatch = lower.match(/(?:who is|what is|search for|tell me about|define)\s+(.+)/i);
  if (searchMatch && searchMatch[1]) {
    const term = searchMatch[1].trim().replace(/[?.]+$/, '');
    const searchRes = await searchWeb(term);
    if (searchRes.success && searchRes.snippet) {
      return { text: `${searchRes.snippet} (Source: ${searchRes.source})`, toolUsed: 'search' };
    }
  }

  // 3. Current Date and Time
  if (/(what time is it|current time|today's date|what is the date|samay kya hai|time entha)/i.test(lower)) {
    const now = new Date();
    const formatted = now.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
    return { text: `It is currently ${formatted}.` };
  }

  // 4. Multilingual Greetings & Language-specific Conversational Responses
  if (language.code === 'te') {
    if (/(namaskaram|namaste|ela|unnaru|bagunnara|hi|hello)/i.test(lower)) {
      return { text: "నమస్కారం! నేను InGPTని. మీరు ఎలా ఉన్నారు? నేను మీకు ఎలా సహాయపడగలను?" };
    }
    return { text: `ధన్యవాదాలు! నేను మీ సందేశాన్ని తెలుగులో అర్థం చేసుకున్నాను: "${text}". నేను మీకు ఏదైనా సమాచారం, కోడింగ్, రచన లేదా వాతావరణ వివరాలలో సహాయం చేయగలను.` };
  }

  if (language.code === 'hi' || language.code === 'hi-Latn') {
    if (/(namaste|namaskar|kaise|kya hal|hi|hello)/i.test(lower)) {
      return { text: "नमस्ते! मैं InGPT हूँ। आपका स्वागत है। बताइए, आज मैं आपकी क्या सहायता कर सकता हूँ?" };
    }
    return { text: `नमस्ते! मैंने आपका संदेश प्राप्त किया: "${text}"। आप मुझसे कोई भी सवाल पूछ सकते हैं—मौसम, तकनीकी प्रश्न, या सामान्य बातचीत!` };
  }

  if (language.code === 'ta') {
    if (/(vanakkam|eppadi|irukkeenga|hi|hello)/i.test(lower)) {
      return { text: "வணக்கம்! நான் InGPT. நீங்கள் எப்படி இருக்கிறீர்கள்? நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?" };
    }
    return { text: `வணக்கம்! உங்கள் கேள்வியை தமிழில் நான் புரிந்து கொண்டேன். உங்களுக்கு உதவ நான் தயாராக உள்ளேன்.` };
  }

  if (language.code === 'kn') {
    return { text: "ನಮಸ್ಕಾರ! ನಾನು InGPT. ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ನಾನು ಸ್ವೀಕರಿಸಿದ್ದೇನೆ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?" };
  }

  if (language.code === 'ml') {
    return { text: "നമസ്കാരം! ഞാൻ InGPT ആണ്. ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?" };
  }

  if (language.code === 'bn') {
    return { text: "নমস্কার! আমি InGPT। আপনার দিনটি কেমন কাটছে? আমি আপনাকে কীভাবে সাহায্য করতে পারি?" };
  }

  if (language.code === 'gu') {
    return { text: "નમસ્તે! હું InGPT છું. તમે કેમ છો? હું તમને કેવી રીતે મદદ કરી શકું?" };
  }

  if (language.code === 'ur') {
    return { text: "السلام علیکم! میں InGPT ہوں۔ میں آپ کی کس طرح مدد کر سکتا ہوں؟" };
  }

  if (language.code === 'es') {
    return { text: "¡Hola! Soy InGPT, tu asistente conversacional con voz e inteligencia artificial. ¿En qué puedo ayudarte hoy?" };
  }

  if (language.code === 'fr') {
    return { text: "Bonjour ! Je suis InGPT, votre assistant vocal et textuel. Comment puis-je vous aider aujourd'hui ?" };
  }

  if (language.code === 'de') {
    return { text: "Hallo! Ich bin InGPT, dein persönlicher KI-Sprachassistent. Wie kann ich dir heute helfen?" };
  }

  if (language.code === 'ja') {
    return { text: "こんにちは！InGPTです。今日はどのようなお手伝いをいたしましょうか？" };
  }

  // General English Assistant Responses
  if (/(hi|hello|hey|greetings)/i.test(lower)) {
    return { text: "Hello! I'm InGPT. You can speak to me naturally by tapping the voice orb, or type any question right here. How can I help you today?" };
  }

  if (/(who are you|what is ingpt|what are you)/i.test(lower)) {
    return { text: "I am InGPT — an all-in-one conversational AI voice assistant. You can speak or type in any language, explore live weather, search facts, brainstorm ideas, write code, and hold natural real-time conversations." };
  }

  return {
    text: `I'm listening and ready to assist you! You asked: "${text}". I can help with information, coding, live weather forecasts, translations, and multi-turn voice conversations. What would you like to explore next?`
  };
}
