import cron from 'node-cron';
import { generateDailyReport } from './nightly-summary.js';
import logger from '../utils/logger.js';

export function setupJobs() {
  // Run daily report at midnight
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running nightly summary job...');
    try {
      await generateDailyReport();
    } catch (error) {
      logger.error('Nightly summary job failed:', error);
    }
  });

  logger.info('✅ Scheduled jobs setup complete');
}
