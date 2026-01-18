import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
// worker/src/config -> worker/src -> worker -> root (three levels up)
// But __dirname is already at worker level when running from worker directory
// So we need to go up one more level to reach project root
const projectRoot = resolve(__dirname, '../../../../');
const envPath = join(projectRoot, '.env');

// Try to load .env from project root
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`⚠️ Failed to load .env from ${envPath}:`, result.error.message);
  // Fallback to default dotenv behavior (current directory)
  dotenv.config();
} else {
  console.log(`✅ Loaded .env from ${envPath}`);
}

export default {
  nodeEnv: process.env.NODE_ENV || 'development',
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
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@taskboard.com',
  },
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  logLevel: process.env.LOG_LEVEL || 'info',
};
