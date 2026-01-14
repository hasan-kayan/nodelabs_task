import { setupMailerConsumer } from './mailer.consumer.js';
import { setupNotifierConsumer } from './notifier.consumer.js';
import { setupAnalyticsConsumer } from './analytics.consumer.js';
import logger from '../utils/logger.js';

export async function setupConsumers() {
  try {
    logger.info('🔧 Setting up all consumers...');
    await setupMailerConsumer();
    await setupNotifierConsumer();
    await setupAnalyticsConsumer();
    logger.info('✅ All consumers setup complete');
    logger.info('👂 Workers are now listening for events...');
  } catch (error) {
    logger.error('❌ Failed to setup consumers:', error);
    throw error;
  }
}
