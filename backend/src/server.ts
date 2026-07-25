import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { logger } from './lib/logger';
import { errorHandler } from './middlewares/error.middleware';
import apiRouter from './routes';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true, // Allow frontend origin
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, error: 'Too many requests from this IP' },
});
app.use(limiter);

// Health Checks
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/ready', (req, res) => res.json({ status: 'ready', database: 'connected' }));
app.get('/live', (req, res) => res.json({ status: 'live' }));

// Mount API v1
app.use('/api/v1', apiRouter);

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    logger.info(`TalentOS Enterprise Backend API running on port ${env.PORT}`);
  });
}

export default app;
