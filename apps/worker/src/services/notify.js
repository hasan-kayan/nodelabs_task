import { getRedisClient } from '../config/redis.js';
import logger from '../utils/logger.js';

export const notifyService = {
  async sendNotification(userId, notification) {
    const redis = getRedisClient();
    
    // Publish to Redis pub/sub for Socket.IO
    await redis.publish('notifications', JSON.stringify({
      userId,
      notification,
    }));

    logger.info(`Notification sent to user ${userId}`);
  },

  async broadcastToProject(projectId, notification) {
    const redis = getRedisClient();
    
    await redis.publish('notifications', JSON.stringify({
      projectId,
      notification,
    }));

    logger.info(`Notification broadcast to project ${projectId}`);
  },
};
