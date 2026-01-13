import amqp from 'amqplib';
import config from './env.js';
import logger from '../utils/logger.js';

let connection = null;
let channel = null;

export async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(config.rabbitmq.url);
    channel = await connection.createChannel();
    
    // Assert exchange
    await channel.assertExchange(config.rabbitmq.exchange, 'topic', {
      durable: true,
    });

    logger.info('✅ RabbitMQ connected');
    return { connection, channel };
  } catch (error) {
    logger.error('❌ RabbitMQ connection error:', error);
    throw error;
  }
}

export function getChannel() {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  return channel;
}

export async function closeRabbitMQ() {
  if (channel) {
    await channel.close();
  }
  if (connection) {
    await connection.close();
  }
  logger.info('RabbitMQ disconnected');
}
