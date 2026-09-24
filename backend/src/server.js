import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import connectDB from './config/db.js';
import { configurePassport } from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import balanceRoutes from './routes/balanceRoutes.js';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// logger.info("GOOGLE_CLIENT_ID Loaded: " + process.env.GOOGLE_CLIENT_ID);

const app = express();
app.set('trust proxy', 1); // Essential for Vercel/Passport to resolve https callback URLs

// Security Middleware
app.use(helmet());

// Global API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per `window`
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true, 
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Stricter Rate Limiter for Auth Routes (Prevents Brute Force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests for auth routes
  message: { message: 'Too many login/register attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'https://www.fairshare.buzz',
  'https://fairshare.buzz',
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      const isLocalNetwork = process.env.NODE_ENV !== 'production' && origin && (origin.startsWith('http://192.168.') || origin.startsWith('http://10.'));
      if (!origin || allowedOrigins.includes(origin) || isLocalNetwork) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(cookieParser());

// HTTP request logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Initialize Passport
configurePassport();
app.use(passport.initialize());

// Ensure DB connection for serverless requests
app.use(async (req, res, next) => {
  // Only connect on request if we are in serverless mode (production or vercel dev)
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    await connectDB();
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/balances', balanceRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

export default app;

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      logger.info(`FairShare server running on http://localhost:${PORT}`);
    });
  });
}
