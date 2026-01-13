import { getChannel } from '../config/rabbit.js';
import config from '../config/env.js';
import logger from '../utils/logger.js';
import Event from '../models/Event.js';

export async function setupAnalyticsConsumer() {
  const channel = getChannel();
  const queue = 'analytics_queue';
  
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, config.rabbitmq.exchange, 'task.*');
  await channel.bindQueue(queue, config.rabbitmq.exchange, 'comment.*');

  await channel.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const content = JSON.parse(msg.content.toString());
      const routingKey = msg.fields.routingKey;
      
      logger.info('📊 Processing analytics event:', routingKey);

      // Store event in MongoDB
      await Event.create({
        type: routingKey,
        data: content,
        timestamp: new Date(),
      });

      // Update metrics (optional)
      // await updateMetrics(routingKey, content);

      channel.ack(msg);
    } catch (error) {
      logger.error('Analytics consumer error:', error);
      channel.nack(msg, false, true);
    }
  });

  logger.info('✅ Analytics consumer started');
}
