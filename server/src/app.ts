import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import pino from 'pino';
import pinoHttp from 'pino-http';
import * as Sentry from '@sentry/node';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import payeRoutes from './routes/payeRoutes.js';
import chilimbaRoutes from './routes/chilimbaRoutes.js';
import recurringRoutes from './routes/recurringRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { me } from './controllers/authController.js';
import { requireAuth } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
const isProd = process.env.NODE_ENV === 'production';
const logger = (pino as unknown as any)({ level: process.env.LOG_LEVEL ?? (isProd ? 'info' : 'debug') });
const sentryDsn = process.env.SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1')
  });
}

app.use((pinoHttp as unknown as any)({ logger }));

function isAllowedDevOrigin(origin: string): boolean {
  if (origin === clientOrigin) {
    return true;
  }

  return /^http:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(
    origin
  );
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (isProd) {
        if (origin === clientOrigin) {
          callback(null, true);
          return;
        }

        callback(new Error('CORS origin not allowed'));
        return;
      }

      if (isAllowedDevOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin not allowed'));
    },
    credentials: false
  })
);

// security headers
app.use(helmet());

// rate limiting
app.use(
  rateLimit({
    windowMs: isProd ? 15 * 60 * 1000 : 60 * 1000,
    max: isProd ? 200 : 60,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/me', requireAuth, me);

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/paye', payeRoutes);
app.use('/api/chilimba', chilimbaRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
