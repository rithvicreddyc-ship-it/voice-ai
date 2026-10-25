import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

export function configureSecurity(app) {
  // Relaxed helmet policy for WebRTC audio streams & fonts
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    })
  );

  // CORS
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Rate Limiter: 120 requests per minute per IP
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: true,
      message: 'Too many requests. Please pause a moment before continuing.'
    }
  });

  app.use('/api/', limiter);
}
