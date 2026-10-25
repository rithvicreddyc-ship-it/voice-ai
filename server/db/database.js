import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'data')
  : path.resolve(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'ingpt.db');

let db = null;
let useMemoryFallback = false;

// Fallback in-memory store for serverless environments where Wasm/disk cannot initialize
const memStore = {
  conversations: new Map(),
  messages: new Map()
};

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[InGPT DB] Warning creating data dir:', err.message);
  }
}

ensureDataDir();

export async function getDb() {
  if (db || useMemoryFallback) return db;

  try {
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
      try {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
      } catch (err) {
        console.warn('Could not read existing database, creating fresh one:', err.message);
        db = new SQL.Database();
      }
    } else {
      db = new SQL.Database();
    }

    // Initialize tables
    db.run(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        language TEXT DEFAULT 'en',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        language TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS preferences (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    saveDb();
    return db;
  } catch (err) {
    console.warn('[InGPT DB] Could not initialize Wasm SQLite, using robust in-memory store:', err.message);
    useMemoryFallback = true;
    return null;
  }
}

export function saveDb() {
  if (!db || useMemoryFallback) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.warn('[InGPT DB] Warning persisting database:', err.message);
  }
}

export async function createConversation(id, title = 'New Conversation', language = 'auto') {
  await getDb();
  const now = Date.now();

  if (useMemoryFallback) {
    const conv = { id, title, language, created_at: now, updated_at: now };
    memStore.conversations.set(id, conv);
    return conv;
  }

  db.run(
    `INSERT OR REPLACE INTO conversations (id, title, language, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
    [id, title, language, now, now]
  );
  saveDb();
  return { id, title, language, created_at: now, updated_at: now };
}

export async function getConversations() {
  await getDb();

  if (useMemoryFallback) {
    return Array.from(memStore.conversations.values())
      .sort((a, b) => b.updated_at - a.updated_at)
      .slice(0, 50);
  }

  const res = db.exec(`SELECT * FROM conversations ORDER BY updated_at DESC LIMIT 50`);
  if (!res.length) return [];
  const columns = res[0].columns;
  return res[0].values.map(row => {
    const obj = {};
    columns.forEach((col, idx) => { obj[col] = row[idx]; });
    return obj;
  });
}

export async function getConversation(id) {
  await getDb();

  if (useMemoryFallback) {
    const conv = memStore.conversations.get(id);
    if (!conv) return null;
    const msgs = (memStore.messages.get(id) || [])
      .slice()
      .sort((a, b) => a.created_at - b.created_at);
    return { ...conv, messages: msgs };
  }

  const res = db.exec(`SELECT * FROM conversations WHERE id = ?`, [id]);
  if (!res.length || !res[0].values.length) return null;
  const columns = res[0].columns;
  const conv = {};
  columns.forEach((col, idx) => { conv[col] = res[0].values[0][idx]; });

  const msgRes = db.exec(
    `SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`,
    [id]
  );
  conv.messages = [];
  if (msgRes.length && msgRes[0].values.length) {
    const msgCols = msgRes[0].columns;
    conv.messages = msgRes[0].values.map(row => {
      const msg = {};
      msgCols.forEach((col, idx) => { msg[col] = row[idx]; });
      return msg;
    });
  }
  return conv;
}

export async function addMessage(id, conversationId, role, content, language = null) {
  await getDb();
  const now = Date.now();

  if (useMemoryFallback) {
    if (!memStore.conversations.has(conversationId)) {
      const title = content.slice(0, 32).trim() || 'Conversation';
      memStore.conversations.set(conversationId, {
        id: conversationId,
        title,
        language: language || 'en',
        created_at: now,
        updated_at: now
      });
    } else {
      const conv = memStore.conversations.get(conversationId);
      conv.updated_at = now;
    }

    if (!memStore.messages.has(conversationId)) {
      memStore.messages.set(conversationId, []);
    }

    const msg = { id, conversation_id: conversationId, role, content, language, created_at: now };
    memStore.messages.get(conversationId).push(msg);
    return msg;
  }

  // Ensure conversation exists
  const existing = db.exec(`SELECT id FROM conversations WHERE id = ?`, [conversationId]);
  if (!existing.length || !existing[0].values.length) {
    const title = content.slice(0, 32).trim() || 'Conversation';
    db.run(
      `INSERT INTO conversations (id, title, language, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [conversationId, title, language || 'en', now, now]
    );
  } else {
    db.run(
      `UPDATE conversations SET updated_at = ? WHERE id = ?`,
      [now, conversationId]
    );
  }

  db.run(
    `INSERT INTO messages (id, conversation_id, role, content, language, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, conversationId, role, content, language, now]
  );

  saveDb();
  return { id, conversation_id: conversationId, role, content, language, created_at: now };
}

export async function deleteConversation(id) {
  await getDb();

  if (useMemoryFallback) {
    memStore.messages.delete(id);
    memStore.conversations.delete(id);
    return { success: true };
  }

  db.run(`DELETE FROM messages WHERE conversation_id = ?`, [id]);
  db.run(`DELETE FROM conversations WHERE id = ?`, [id]);
  saveDb();
  return { success: true };
}

export async function clearAllConversations() {
  await getDb();

  if (useMemoryFallback) {
    memStore.messages.clear();
    memStore.conversations.clear();
    return { success: true };
  }

  db.run(`DELETE FROM messages`);
  db.run(`DELETE FROM conversations`);
  saveDb();
  return { success: true };
}
