import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    application: 'InGPT',
    tagline: 'Your AI. Your Voice. Your Conversation.',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    capabilities: {
      realtimeVoice: !!process.env.OPENAI_API_KEY,
      textChat: true,
      weatherLive: true,
      searchLive: true,
      indianLanguages: 22,
      persistentStorage: true
    }
  });
});

export default router;
