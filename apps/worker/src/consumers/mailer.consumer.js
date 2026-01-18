import { getChannel } from '../config/rabbit.js';
import config from '../config/env.js';
import logger from '../utils/logger.js';
import { sendOTPEmail, sendTeamInvitationEmail } from '../services/mailer.js';

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

        // Send OTP via email if email is provided
        if (content.email && content.otp) {
          try {
            await sendOTPEmail({
              email: content.email,
              otp: content.otp,
              mode: content.mode || 'login',
              name: content.name,
            });
            logger.info(`✅ OTP email sent to ${content.email}`);
          } catch (error) {
            logger.error(`❌ Failed to send OTP email to ${content.email}:`, error);
            // Still log OTP for testing even if email fails
          }
        }

        // Log OTP clearly for testing (always log, even if email is sent)
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

        // TODO: Implement SMS sending for phone numbers
        if (content.phone && content.otp) {
          logger.info(`📱 SMS OTP to ${content.phone}: ${content.otp} (SMS not implemented yet)`);
        }
      } else if (routingKey === 'team.invitation') {
        logger.info('📧 Processing team invitation event:', {
          teamId: content.teamId,
          teamName: content.teamName,
          userEmail: content.userEmail,
          role: content.role,
          invitedBy: content.invitedBy,
          timestamp: content.timestamp,
        });
        
        // Get inviter name from event (if provided) or use default
        const inviterName = content.inviterName || 'A team admin';

        // Send invitation email
        try {
          await sendTeamInvitationEmail({
            email: content.userEmail,
            teamName: content.teamName,
            inviterName,
            role: content.role || 'member',
            teamId: content.teamId,
          });
          logger.info(`✅ Team invitation email sent to ${content.userEmail}`);
        } catch (error) {
          logger.error(`❌ Failed to send team invitation email to ${content.userEmail}:`, error);
        }
        
        // Log invitation details for testing
        logger.info('');
        logger.info('═══════════════════════════════════════════════════════');
        logger.info(`👥 TEAM INVITATION:`);
        logger.info(`   Team: ${content.teamName}`);
        logger.info(`   To: ${content.userEmail}`);
        logger.info(`   Role: ${content.role}`);
        logger.info(`   Invited by: ${inviterName} (${content.invitedBy})`);
        logger.info(`   Status: Pending approval`);
        logger.info('═══════════════════════════════════════════════════════');
        logger.info('');
      }

      channel.ack(msg);
    } catch (error) {
      logger.error('Mailer consumer error:', error);
      channel.nack(msg, false, true); // Requeue on error
    }
  });

  logger.info('✅ Mailer consumer started');
}
