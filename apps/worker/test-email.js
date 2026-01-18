import './src/config/env.js';
import { sendTeamInvitationEmail } from './src/services/mailer.js';
import logger from './src/utils/logger.js';

async function testEmail() {
  try {
    logger.info('🧪 Starting email test...');
    
    const testData = {
      email: 'hasankayan2000@hotmail.com',
      teamName: 'Test Team',
      inviterName: 'Test Admin',
      role: 'member',
      teamId: '507f1f77bcf86cd799439011',
    };
    
    logger.info('🧪 Test data:', testData);
    
    const result = await sendTeamInvitationEmail(testData);
    
    logger.info('🧪 Test result:', {
      messageId: result.messageId,
      isStub: result.messageId?.startsWith('stub-'),
    });
    
    if (result.messageId?.startsWith('stub-')) {
      logger.error('❌ Email was NOT sent - running in STUB mode!');
      logger.error('❌ Check SMTP configuration in .env file');
      process.exit(1);
    } else {
      logger.info('✅ Email sent successfully!');
      logger.info('📧 Check the recipient inbox (and spam folder)');
      process.exit(0);
    }
  } catch (error) {
    logger.error('❌ Test failed:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack,
      fullError: error,
    });
    console.error('Full error:', error);
    process.exit(1);
  }
}

testEmail();
