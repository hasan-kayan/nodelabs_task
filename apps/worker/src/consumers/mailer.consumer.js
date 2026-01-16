import { getChannel } from '../config/rabbit.js';
import config from '../config/env.js';
import logger from '../utils/logger.js';

export async function setupMailerConsumer() {
  const channel = getChannel();
  const queue = 'mailer_queue';
  
  logger.info('🔧 Setting up mailer consumer...');
  await channel.assertQueue(queue, { durable: true });
  logger.info(`✅ Queue asserted: ${queue}`);
  
  // Bind to multiple routing keys
  await channel.bindQueue(queue, config.rabbitmq.exchange, 'otp.requested');
  await channel.bindQueue(queue, config.rabbitmq.exchange, 'team.invitation');
  logger.info(`✅ Queue bound to exchange: ${config.rabbitmq.exchange} with routing keys: otp.requested, team.invitation`);

  logger.info('👂 Waiting for mailer events...');
  await channel.consume(queue, async (msg) => {
    if (!msg) {
      logger.warn('⚠️ Received null message');
      return;
    }

    try {
      logger.info('📨 Received message from queue');
      const content = JSON.parse(msg.content.toString());
      const routingKey = msg.fields.routingKey;
      
      if (routingKey === 'otp.requested') {
        logger.info('📧 Processing OTP event:', {
          email: content.email,
          phone: content.phone,
          mode: content.mode,
          timestamp: content.timestamp,
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
      } else if (routingKey === 'team.invitation') {
        logger.info('📧 Processing team invitation event:', {
          teamId: content.teamId,
          teamName: content.teamName,
          userEmail: content.userEmail,
          role: content.role,
          invitedBy: content.invitedBy,
          timestamp: content.timestamp,
        });
        
        // Log invitation details for testing
        logger.info('');
        logger.info('═══════════════════════════════════════════════════════');
        logger.info(`👥 TEAM INVITATION:`);
        logger.info(`   Team: ${content.teamName}`);
        logger.info(`   To: ${content.userEmail}`);
        logger.info(`   Role: ${content.role}`);
        logger.info(`   Invited by: ${content.invitedBy}`);
        logger.info(`   Status: Pending approval`);
        logger.info('═══════════════════════════════════════════════════════');
        logger.info('');
        
        // STUB MODE: In production, send actual email:
        // await sendEmail({
        //   to: content.userEmail,
        //   subject: `You've been invited to join ${content.teamName}`,
        //   body: `You have been invited to join the team "${content.teamName}" as a ${content.role}. Please log in to accept or reject the invitation.`
        // });
      }

      channel.ack(msg);
    } catch (error) {
      logger.error('Mailer consumer error:', error);
      channel.nack(msg, false, true); // Requeue on error
    }
  });

  logger.info('✅ Mailer consumer started');
}
