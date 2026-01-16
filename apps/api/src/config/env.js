import dotenv from 'dotenv';

dotenv.config();

export default {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.API_PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/taskboard',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'taskboard_events',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  otp: {
    expiry: parseInt(process.env.OTP_EXPIRY || '300'),
    length: parseInt(process.env.OTP_LENGTH || '6'),
  },
  cors: {
    origin: process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : ['http://localhost:5173', 'http://localhost:3000'],
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  logLevel: process.env.LOG_LEVEL || 'info',
};
