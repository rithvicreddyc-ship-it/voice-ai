import express from 'express';
import { getWeather } from '../services/weatherService.js';
import { searchWeb } from '../services/searchService.js';
import { LANGUAGE_REGISTRY, detectLanguage } from '../services/languageService.js';

const router = express.Router();

// Live Weather
router.get('/weather', async (req, res, next) => {
  try {
    const { location = 'London' } = req.query;
    const weather = await getWeather(location);
    res.json(weather);
  } catch (err) {
    next(err);
  }
});

// Live Search
router.get('/search', async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const result = await searchWeb(q);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Languages Capability Registry
router.get('/languages', (req, res) => {
  res.json({
    success: true,
    languages: LANGUAGE_REGISTRY,
    total: Object.keys(LANGUAGE_REGISTRY).length,
    description: 'Registry of all 22 Eighth Schedule Indian languages plus primary world languages with modality capabilities.'
  });
});

// Detect Language from text
router.post('/detect-language', (req, res) => {
  const { text = '' } = req.body || {};
  const detected = detectLanguage(text);
  res.json({ success: true, detected });
});

export default router;
