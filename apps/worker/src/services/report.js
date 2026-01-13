import logger from '../utils/logger.js';
import Event from '../models/Event.js';

export const reportService = {
  async generateDailyReport() {
    logger.info('Generating daily report...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const events = await Event.find({
      timestamp: { $gte: today, $lt: tomorrow },
    });

    const metrics = {
      tasksCreated: events.filter(e => e.type === 'task.created').length,
      tasksAssigned: events.filter(e => e.type === 'task.assigned').length,
      commentsAdded: events.filter(e => e.type === 'comment.added').length,
    };

    logger.info('Daily report metrics:', metrics);
    return metrics;
  },
};
