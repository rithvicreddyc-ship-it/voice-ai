import express from 'express';
import {
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,
  clearAllConversations
} from '../db/database.js';

const router = express.Router();

// List all conversations
router.get('/', async (req, res, next) => {
  try {
    const list = await getConversations();
    res.json({ success: true, conversations: list });
  } catch (err) {
    next(err);
  }
});

// Get a specific conversation with messages
router.get('/:id', async (req, res, next) => {
  try {
    const conv = await getConversation(req.params.id);
    if (!conv) {
      return res.status(404).json({ error: true, message: 'Conversation not found.' });
    }
    res.json({ success: true, conversation: conv });
  } catch (err) {
    next(err);
  }
});

// Create a new conversation
router.post('/', async (req, res, next) => {
  try {
    const { id, title = 'New Conversation', language = 'auto' } = req.body || {};
    const convId = id || ('conv_' + Date.now());
    const conv = await createConversation(convId, title, language);
    res.json({ success: true, conversation: conv });
  } catch (err) {
    next(err);
  }
});

// Delete a single conversation
router.delete('/:id', async (req, res, next) => {
  try {
    await deleteConversation(req.params.id);
    res.json({ success: true, message: 'Conversation deleted.' });
  } catch (err) {
    next(err);
  }
});

// Clear all conversations
router.delete('/', async (req, res, next) => {
  try {
    await clearAllConversations();
    res.json({ success: true, message: 'All conversations cleared.' });
  } catch (err) {
    next(err);
  }
});

export default router;
