import './config/env.js';
import { connectMongo } from './config/mongo.js';
import { connectRabbitMQ } from './config/rabbit.js';
import { connectRedis } from './config/redis.js';
import { setupConsumers } from './consumers/index.js';
import { setupJobs } from './jobs/index.js';
import logger from './utils/logger.js';

async function bootstrap() {
  try {
    // Connect to databases
    await connectMongo();
    await connectRabbitMQ();
    await connectRedis();

    // Setup RabbitMQ consumers
    await setupConsumers();

    // Setup scheduled jobs
    setupJobs();

    logger.info('✅ Worker started successfully');
  } catch (error) {
    logger.error('Failed to start worker:', error);
    process.exit(1);
  }
}

bootstrap();
