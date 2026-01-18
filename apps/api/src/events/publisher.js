import { publishEvent as rabbitPublish } from '../config/rabbit.js';
import logger from '../utils/logger.js';

export async function publishEvent(topic, message) {
  logger.info(`📤 [EVENT PUBLISHER] Publishing event: ${topic}`, {
    topic,
    messageKeys: Object.keys(message),
    messageSize: JSON.stringify(message).length,
  });
  
  try {
    await rabbitPublish(topic, message);
    logger.info(`✅ [EVENT PUBLISHER] Event published successfully: ${topic}`, {
      topic,
      messageId: message.userId || message.email || 'unknown',
    });
  } catch (error) {
    logger.error(`❌ [EVENT PUBLISHER] Failed to publish event ${topic}:`, {
      topic,
      error: error.message,
      stack: error.stack,
      message,
    });
    throw error;
  }
}
