import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { configureSecurity } from './middleware/security.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getDb } from './db/database.js';

import healthRouter from './routes/health.js';
import realtimeRouter from './routes/realtime.js';
import chatRouter from './routes/chat.js';
import conversationsRouter from './routes/conversations.js';
import toolsRouter from './routes/tools.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security and middleware
configureSecurity(app);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/realtime', realtimeRouter);
app.use('/api/chat', chatRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/tools', toolsRouter);

// Serve client static build in production (checking root dist or client/dist)
const distInRoot = path.resolve(__dirname, '../dist');
const distInClient = path.resolve(__dirname, '../client/dist');
const clientDist = fs.existsSync(distInRoot) ? distInRoot : distInClient;
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>InGPT Server</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #FAFAF9; color: #292D35;">
            <h1>InGPT Backend is Running</h1>
            <p>API endpoints are active at <code>/api/*</code>.</p>
            <p>Run <code>npm run dev</code> for frontend development or <code>npm run build</code> to compile client assets.</p>
          </body>
        </html>
      `);
    }
  });
});

// Central error handler
app.use(errorHandler);

// Initialize DB and start server
async function startServer() {
  try {
    await getDb();
    console.log('[InGPT DB] SQLite storage initialized successfully.');

    const server = app.listen(PORT, () => {
      console.log(`[InGPT Server] Listening on http://localhost:${PORT}`);
      console.log(`[InGPT Realtime] OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not set (Fallback Web Speech mode enabled)'}`);
    });

    const shutdown = () => {
      console.log('[InGPT Server] Gracefully shutting down...');
      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('[InGPT Server] Failed to start:', err);
    process.exit(1);
  }
if (process.env.VERCEL !== '1') {
  startServer();
} else {
  getDb().catch(console.error);
}

export default app;
