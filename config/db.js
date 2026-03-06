import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  if (!env.mongoUri) {
    throw new Error('MONGO_URI is missing. Add it to your .env file.');
  }

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 5000
  });
  console.log('MongoDB connected');
};
