import { getChannel } from '../config/rabbit.js';
import { getRedisClient } from '../config/redis.js';
import config from '../config/env.js';
import logger from '../utils/logger.js';

export async function setupNotifierConsumer() {
  const channel = getChannel();
  const queue = 'notifier_queue';
  
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, config.rabbitmq.exchange, 'task.*');
  await channel.bindQueue(queue, config.rabbitmq.exchange, 'comment.added');

  await channel.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const content = JSON.parse(msg.content.toString());
      const routingKey = msg.fields.routingKey;
      
      logger.info('🔔 Processing notification event:', routingKey, content);

      // Fan-out to Socket.IO via Redis pub/sub or HTTP call to API
      const redis = getRedisClient();
      await redis.publish('notifications', JSON.stringify({
        type: routingKey,
        data: content,
      }));

      // Store notification in database (optional)
      // await notificationService.create(content);

      channel.ack(msg);
    } catch (error) {
      logger.error('Notifier consumer error:', error);
      channel.nack(msg, false, true);
    }
  });

  logger.info('✅ Notifier consumer started');
}
