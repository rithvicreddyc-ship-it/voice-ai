import test from 'node:test';
import assert from 'node:assert';
import { getDb, createConversation, addMessage, getConversation, deleteConversation, clearAllConversations } from '../server/db/database.js';

test('Database - Initialize and perform CRUD operations', async () => {
  const db = await getDb();
  assert.ok(db, 'Database should initialize');

  await clearAllConversations();

  const convId = 'test_conv_001';
  const conv = await createConversation(convId, 'Test Conversation', 'en');
  assert.strictEqual(conv.id, convId);
  assert.strictEqual(conv.title, 'Test Conversation');

  const msg1 = await addMessage('m1', convId, 'user', 'Hello InGPT!', 'en');
  assert.strictEqual(msg1.content, 'Hello InGPT!');

  const msg2 = await addMessage('m2', convId, 'assistant', 'Hello! How can I assist you?', 'en');
  assert.strictEqual(msg2.role, 'assistant');

  const fetched = await getConversation(convId);
  assert.ok(fetched, 'Should fetch conversation');
  assert.strictEqual(fetched.messages.length, 2);

  await deleteConversation(convId);
  const afterDelete = await getConversation(convId);
  assert.strictEqual(afterDelete, null, 'Deleted conversation should not exist');
});
