import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { auth } from './middleware/auth.js';

const app = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database unavailable. Retrying connection.' });
  }
  return next();
});
app.use('/api/auth', authRoutes);
app.use('/api/tasks', auth, taskRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong.' });
});

const startMongoWithRetry = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.log('Retrying MongoDB connection in 10s...');
    setTimeout(startMongoWithRetry, 10000);
  }
};

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
  startMongoWithRetry();
});
