import { reportService } from '../services/report.js';
import logger from '../utils/logger.js';

export async function generateDailyReport() {
  try {
    const report = await reportService.generateDailyReport();
    logger.info('Daily report generated:', report);
    return report;
  } catch (error) {
    logger.error('Failed to generate daily report:', error);
    throw error;
  }
}
