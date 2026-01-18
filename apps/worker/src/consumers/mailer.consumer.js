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
      logger.warn('⚠️ [MAILER CONSUMER] Received null message');
      return;
    }

    try {
      logger.info('📨 [MAILER CONSUMER] Received message from queue', {
        queue,
        messageId: msg.properties.messageId,
        timestamp: new Date().toISOString(),
      });
      
      const content = JSON.parse(msg.content.toString());
      const routingKey = msg.fields.routingKey;
      
      logger.info('📨 [MAILER CONSUMER] Message parsed successfully', {
        routingKey,
        contentKeys: Object.keys(content),
        contentSize: msg.content.length,
      });
      
      if (routingKey === 'otp.requested') {
        logger.info('📧 [MAILER CONSUMER] Processing OTP event:', {
          email: content.email,
          phone: content.phone,
          mode: content.mode,
          timestamp: content.timestamp,
          hasOtp: !!content.otp,
        });

        // Send OTP via email if email is provided
        if (content.email && content.otp) {
          logger.info('📧 [MAILER CONSUMER] Sending OTP email...', {
            email: content.email,
            mode: content.mode || 'login',
          });
          try {
            await sendOTPEmail({
              email: content.email,
              otp: content.otp,
              mode: content.mode || 'login',
              name: content.name,
            });
            logger.info(`✅ [MAILER CONSUMER] OTP email sent successfully to ${content.email}`);
          } catch (error) {
            logger.error(`❌ [MAILER CONSUMER] Failed to send OTP email to ${content.email}:`, {
              error: error.message,
              stack: error.stack,
            });
            // Still log OTP for testing even if email fails
          }
        } else {
          logger.warn('⚠️ [MAILER CONSUMER] OTP event missing email or OTP', {
            hasEmail: !!content.email,
            hasOtp: !!content.otp,
          });
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
        logger.info('📧 [MAILER CONSUMER] Processing team invitation event:', {
          teamId: content.teamId,
          teamName: content.teamName,
          userEmail: content.userEmail,
          userId: content.userId,
          role: content.role,
          invitedBy: content.invitedBy,
          inviterName: content.inviterName,
          timestamp: content.timestamp,
        });
        
        // Validate required fields
        if (!content.userEmail) {
          logger.error('❌ [MAILER CONSUMER] Team invitation event missing userEmail');
          channel.ack(msg);
          return;
        }
        if (!content.teamId) {
          logger.error('❌ [MAILER CONSUMER] Team invitation event missing teamId');
          channel.ack(msg);
          return;
        }
        if (!content.teamName) {
          logger.warn('⚠️ [MAILER CONSUMER] Team invitation event missing teamName');
        }
        
        // Get inviter name from event (if provided) or use default
        const inviterName = content.inviterName || 'A team admin';
        logger.info('📧 [MAILER CONSUMER] Invitation details prepared:', {
          email: content.userEmail,
          teamName: content.teamName,
          teamId: content.teamId,
          inviterName,
          role: content.role || 'member',
        });

        // Send invitation email
        logger.info('📧 [MAILER CONSUMER] Calling sendTeamInvitationEmail...');
        logger.info('📧 [MAILER CONSUMER] Email parameters:', {
          email: content.userEmail,
          teamName: content.teamName,
          teamId: content.teamId,
          inviterName,
          role: content.role || 'member',
        });
        
        try {
          const result = await sendTeamInvitationEmail({
            email: content.userEmail,
            teamName: content.teamName,
            inviterName,
            role: content.role || 'member',
            teamId: content.teamId,
          });
          
          logger.info(`✅ [MAILER CONSUMER] Team invitation email process completed`, {
            email: content.userEmail,
            messageId: result?.messageId,
            teamId: content.teamId,
            isStub: result?.messageId?.startsWith('stub-'),
          });
          
          if (result?.messageId?.startsWith('stub-')) {
            logger.warn('⚠️ [MAILER CONSUMER] Email was NOT actually sent - running in STUB mode!');
            logger.warn('⚠️ [MAILER CONSUMER] To send real emails, configure SMTP_USER and SMTP_PASS environment variables');
            logger.info('📧 [MAILER CONSUMER] Email content that would be sent:');
            logger.info(`   To: ${content.userEmail}`);
            logger.info(`   Subject: You've been invited to join ${content.teamName}`);
            logger.info(`   Invitation URL: ${process.env.APP_URL || 'http://localhost:5173'}/teams/${content.teamId}`);
          } else {
            logger.info(`✅ [MAILER CONSUMER] Email was successfully sent to ${content.userEmail}`, {
              messageId: result.messageId,
              response: result.response,
            });
          }
        } catch (error) {
          logger.error(`❌ [MAILER CONSUMER] Failed to send team invitation email to ${content.userEmail}:`, {
            error: error.message,
            stack: error.stack,
            code: error.code,
            command: error.command,
            teamId: content.teamId,
            teamName: content.teamName,
          });
          logger.error('❌ [MAILER CONSUMER] Full error details:', error);
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

      logger.info('✅ [MAILER CONSUMER] Message processed successfully, acknowledging...');
      channel.ack(msg);
    } catch (error) {
      logger.error('❌ [MAILER CONSUMER] Error processing message:', {
        error: error.message,
        stack: error.stack,
        routingKey: msg?.fields?.routingKey,
      });
      channel.nack(msg, false, true); // Requeue on error
    }
  });

  logger.info('✅ Mailer consumer started');
}
