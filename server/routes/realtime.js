import express from 'express';
import { createRealtimeSession } from '../services/realtimeService.js';

const router = express.Router();

router.post('/session', async (req, res, next) => {
  try {
    const { voice, instructions } = req.body || {};
    const session = await createRealtimeSession({ voice, instructions });
    res.json(session);
  } catch (err) {
    next(err);
  }
});

export default router;
