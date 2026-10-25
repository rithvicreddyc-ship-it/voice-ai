import test from 'node:test';
import assert from 'node:assert';
import { detectLanguage, isRTL, LANGUAGE_REGISTRY } from '../server/services/languageService.js';

test('Language Detection - Telugu script', () => {
  const result = detectLanguage('నమస్కారం, ఈ రోజు వాతావరణం ఎలా ఉంది?');
  assert.strictEqual(result.code, 'te');
  assert.strictEqual(result.name, 'Telugu');
  assert.strictEqual(isRTL(result.code), false);
});

test('Language Detection - Hindi Devanagari script', () => {
  const result = detectLanguage('नमस्ते! आप कैसे हैं?');
  assert.strictEqual(result.code, 'hi');
  assert.strictEqual(result.name, 'Hindi');
  assert.strictEqual(isRTL(result.code), false);
});

test('Language Detection - Tamil script', () => {
  const result = detectLanguage('வணக்கம், இன்று மழை வருமா?');
  assert.strictEqual(result.code, 'ta');
  assert.strictEqual(result.name, 'Tamil');
});

test('Language Detection - Urdu Perso-Arabic (RTL)', () => {
  const result = detectLanguage('السلام علیکم، آپ کا دن کیسا گزرا؟');
  assert.strictEqual(result.code, 'ur');
  assert.strictEqual(isRTL(result.code), true);
});

test('Language Detection - Hinglish transliteration', () => {
  const result = detectLanguage('Aap kaise ho bhai? Mujhe ek baat batao');
  assert.strictEqual(result.code, 'hi-Latn');
  assert.strictEqual(result.script, 'Latin (Transliterated)');
});

test('Language Detection - World Languages (Spanish)', () => {
  const result = detectLanguage('Hola amigo, ¿cómo estás hoy?');
  assert.strictEqual(result.code, 'es');
  assert.strictEqual(result.name, 'Spanish');
});

test('Eighth Schedule Coverage - 22 Languages Present', () => {
  const eighthSchedule = [
    'as', 'bn', 'brx', 'doi', 'gu', 'hi', 'kn', 'ks', 'kok', 'mai',
    'ml', 'mni', 'mr', 'ne', 'or', 'pa', 'sa', 'sat', 'sd', 'ta', 'te', 'ur'
  ];
  for (const code of eighthSchedule) {
    assert.ok(LANGUAGE_REGISTRY[code], `Eighth Schedule language "${code}" must be present in registry`);
  }
});
