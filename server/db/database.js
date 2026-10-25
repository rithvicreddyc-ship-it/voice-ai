import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'ingpt.db');

let db = null;

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export async function getDb() {
  if (db) return db;

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
      created_at INTEGER NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS preferences (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  saveDb();
  return db;
}

export function saveDb() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('Error persisting database:', err.message);
  }
}

export async function createConversation(id, title = 'New Conversation', language = 'auto') {
  const database = await getDb();
  const now = Date.now();
  database.run(
    `INSERT OR REPLACE INTO conversations (id, title, language, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
    [id, title, language, now, now]
  );
  saveDb();
  return { id, title, language, created_at: now, updated_at: now };
}

export async function getConversations() {
  const database = await getDb();
  const res = database.exec(`SELECT * FROM conversations ORDER BY updated_at DESC LIMIT 50`);
  if (!res.length) return [];
  const columns = res[0].columns;
  return res[0].values.map(row => {
    const obj = {};
    columns.forEach((col, idx) => { obj[col] = row[idx]; });
    return obj;
  });
}

export async function getConversation(id) {
  const database = await getDb();
  const res = database.exec(`SELECT * FROM conversations WHERE id = ?`, [id]);
  if (!res.length || !res[0].values.length) return null;
  const columns = res[0].columns;
  const conv = {};
  columns.forEach((col, idx) => { conv[col] = res[0].values[0][idx]; });

  const msgRes = database.exec(
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
  const database = await getDb();
  const now = Date.now();

  // Ensure conversation exists
  const existing = database.exec(`SELECT id FROM conversations WHERE id = ?`, [conversationId]);
  if (!existing.length || !existing[0].values.length) {
    const title = content.slice(0, 32).trim() || 'Conversation';
    database.run(
      `INSERT INTO conversations (id, title, language, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [conversationId, title, language || 'en', now, now]
    );
  } else {
    database.run(
      `UPDATE conversations SET updated_at = ? WHERE id = ?`,
      [now, conversationId]
    );
  }

  database.run(
    `INSERT INTO messages (id, conversation_id, role, content, language, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, conversationId, role, content, language, now]
  );

  saveDb();
  return { id, conversation_id: conversationId, role, content, language, created_at: now };
}

export async function deleteConversation(id) {
  const database = await getDb();
  database.run(`DELETE FROM messages WHERE conversation_id = ?`, [id]);
  database.run(`DELETE FROM conversations WHERE id = ?`, [id]);
  saveDb();
  return { success: true };
}

export async function clearAllConversations() {
  const database = await getDb();
  database.run(`DELETE FROM messages`);
  database.run(`DELETE FROM conversations`);
  saveDb();
  return { success: true };
}
