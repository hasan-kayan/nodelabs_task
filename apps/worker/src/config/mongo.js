import mongoose from 'mongoose';
import config from './env.js';
import logger from '../utils/logger.js';

let isConnected = false;

export async function connectMongo() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(config.mongoUri);
    isConnected = true;
    logger.info('✅ MongoDB connected');
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectMongo() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected');
  }
}
