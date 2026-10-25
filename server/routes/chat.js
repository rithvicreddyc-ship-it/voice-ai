import express from 'express';
import { processChat } from '../services/aiService.js';
import { addMessage, getConversation } from '../db/database.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { message, conversationId = 'default', history = [] } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: true, message: 'Message cannot be empty.' });
    }

    if (message.length > 5000) {
      return res.status(400).json({ error: true, message: 'Message exceeds maximum length of 5000 characters.' });
    }

    // Process message with AI & tool calling
    const result = await processChat({ message, history });

    if (result.error) {
      return res.status(500).json(result);
    }

    // Persist messages in SQLite database
    const userMsgId = 'msg_' + Date.now() + '_u';
    const aiMsgId = 'msg_' + (Date.now() + 1) + '_a';

    try {
      await addMessage(userMsgId, conversationId, 'user', message, result.language?.code);
      await addMessage(aiMsgId, conversationId, 'assistant', result.reply, result.language?.code);
    } catch (dbErr) {
      console.warn('Could not persist message in DB:', dbErr.message);
    }

    res.json({
      success: true,
      reply: result.reply,
      language: result.language,
      isRTL: result.isRTL,
      modelUsed: result.modelUsed,
      provider: result.provider,
      toolUsed: result.toolUsed || null,
      messageId: aiMsgId,
      timestamp: Date.now()
    });
  } catch (err) {
    next(err);
  }
});

export default router;
