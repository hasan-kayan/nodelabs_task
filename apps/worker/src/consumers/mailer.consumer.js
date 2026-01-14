import { getChannel } from '../config/rabbit.js';
import config from '../config/env.js';
import logger from '../utils/logger.js';

export async function setupMailerConsumer() {
  const channel = getChannel();
  const queue = 'mailer_queue';
  
  logger.info('🔧 Setting up mailer consumer...');
  await channel.assertQueue(queue, { durable: true });
  logger.info(`✅ Queue asserted: ${queue}`);
  
  await channel.bindQueue(queue, config.rabbitmq.exchange, 'otp.requested');
  logger.info(`✅ Queue bound to exchange: ${config.rabbitmq.exchange} with routing key: otp.requested`);

  logger.info('👂 Waiting for OTP events...');
  await channel.consume(queue, async (msg) => {
    if (!msg) {
      logger.warn('⚠️ Received null message');
      return;
    }

    try {
      logger.info('📨 Received message from queue');
      const content = JSON.parse(msg.content.toString());
      logger.info('📧 Processing mailer event:', {
        email: content.email,
        phone: content.phone,
        mode: content.mode,
        timestamp: content.timestamp,
        // OTP is logged for stub mode only
        // In production, OTP should be retrieved from secure storage
      });

      // STUB MODE: Just log the OTP
      // In production, implement actual email/SMS sending:
      // 
      // if (content.email) {
      //   await sendEmail({
      //     to: content.email,
      //     subject: 'Your OTP Code',
      //     body: `Your OTP code is: ${otp} (valid for 5 minutes)`
      //   });
      // }
      // 
      // if (content.phone) {
      //   await sendSMS({
      //     to: content.phone,
      //     message: `Your OTP code is: ${otp} (valid for 5 minutes)`
      //   });
      // }

      // Log OTP clearly for testing
      logger.info('');
      logger.info('═══════════════════════════════════════════════════════');
      logger.info(`📱 OTP CODE FOR TESTING:`);
      logger.info(`   ${content.otp}`);
      logger.info(`   To: ${content.email || content.phone}`);
      logger.info(`   Mode: ${content.mode}`);
      logger.info(`   Name: ${content.name || 'N/A'}`);
      logger.info(`   Valid for: 5 minutes`);
      logger.info('═══════════════════════════════════════════════════════');
      logger.info('');

      channel.ack(msg);
    } catch (error) {
      logger.error('Mailer consumer error:', error);
      channel.nack(msg, false, true); // Requeue on error
    }
  });

  logger.info('✅ Mailer consumer started');
}
