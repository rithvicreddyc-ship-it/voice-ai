/**
 * InGPT Realtime Voice Service
 * Generates short-lived ephemeral client session tokens for OpenAI Realtime API WebRTC connection.
 */

import { getLanguageSystemPrompt } from './languageService.js';

export async function createRealtimeSession(options = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return {
      available: false,
      reason: 'OPENAI_API_KEY is not configured on the server.',
      fallbackMode: 'browser-speech'
    };
  }

  const model = process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-12-17';
  const voice = options.voice || process.env.OPENAI_VOICE || 'alloy';
  const instructions = options.instructions || getLanguageSystemPrompt();

  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        voice,
        instructions,
        input_audio_transcription: {
          model: 'whisper-1'
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 600
        }
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsed;
      try { parsed = JSON.parse(errorText); } catch (_) {}
      console.error('OpenAI Realtime session error:', response.status, errorText);
      return {
        available: false,
        error: true,
        statusCode: response.status,
        message: parsed?.error?.message || `OpenAI returned status ${response.status}`,
        fallbackMode: 'browser-speech'
      };
    }

    const sessionData = await response.json();

    return {
      available: true,
      model,
      voice,
      clientSecret: sessionData.client_secret?.value,
      expiresAt: sessionData.client_secret?.expires_at,
      sessionId: sessionData.id,
      turnDetection: sessionData.turn_detection
    };
  } catch (err) {
    console.error('Failed to contact OpenAI Realtime API:', err.message);
    return {
      available: false,
      error: true,
      message: err.message,
      fallbackMode: 'browser-speech'
    };
  }
}
