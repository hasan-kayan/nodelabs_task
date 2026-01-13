import { publishEvent as rabbitPublish } from '../config/rabbit.js';
import logger from '../utils/logger.js';

export async function publishEvent(topic, message) {
  try {
    await rabbitPublish(topic, message);
    logger.info(`Event published: ${topic}`);
  } catch (error) {
    logger.error(`Failed to publish event ${topic}:`, error);
    throw error;
  }
}
