import nodemailer from 'nodemailer';
import config from '../config/env.js';
import logger from '../utils/logger.js';

// Create reusable transporter
let transporter = null;

async function createTransporter() {
  if (transporter) {
    logger.info('📧 [MAILER] Reusing existing SMTP transporter');
    return transporter;
  }

  logger.info('📧 [MAILER] Creating SMTP transporter...', {
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    hasUser: !!config.smtp.auth.user,
    hasPass: !!config.smtp.auth.pass,
    from: config.smtp.from,
  });

  // If SMTP is not configured, return null (will use stub mode)
  if (!config.smtp.auth.user || !config.smtp.auth.pass) {
    logger.warn('⚠️ [MAILER] SMTP not configured. Email sending will be stubbed.', {
      user: config.smtp.auth.user || 'NOT SET',
      pass: config.smtp.auth.pass ? '***SET***' : 'NOT SET',
      host: config.smtp.host,
      port: config.smtp.port,
    });
    logger.warn('⚠️ [MAILER] To enable email sending, set SMTP_USER and SMTP_PASS environment variables');
    return null;
  }

  logger.info('📧 [MAILER] SMTP credentials found, creating transporter...');
  
  // Gmail için özel ayarlar
  const transporterConfig = {
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure, // true for 465, false for other ports
    auth: {
      user: config.smtp.auth.user,
      pass: config.smtp.auth.pass,
    },
  };

  // Gmail için ek güvenlik ayarları
  if (config.smtp.host.includes('gmail.com')) {
    transporterConfig.requireTLS = true;
    transporterConfig.tls = {
      rejectUnauthorized: false, // Development için
    };
  }

  transporter = nodemailer.createTransport(transporterConfig);

  // SMTP bağlantısını test et (sadece ilk kez)
  try {
    logger.info('📧 [MAILER] Verifying SMTP connection...');
    await transporter.verify();
    logger.info('✅ [MAILER] SMTP connection verified successfully', {
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      user: config.smtp.auth.user,
    });
  } catch (error) {
    logger.error('❌ [MAILER] SMTP connection verification failed:', {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    logger.warn('⚠️ [MAILER] Continuing anyway - email sending may fail');
    // Yine de transporter'ı döndür, belki gönderme çalışır
  }

  logger.info('✅ [MAILER] SMTP transporter created successfully', {
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
  });

  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  logger.info('📧 [MAILER] Starting email send process...');
  logger.info('📧 [MAILER] Email details:', {
    to,
    subject,
    from: config.smtp.from,
    hasHtml: !!html,
    hasText: !!text,
  });

  const mailTransporter = await createTransporter();

  if (!mailTransporter) {
    // Stub mode: just log
    logger.warn('⚠️ [MAILER] SMTP not configured - running in STUB mode');
    logger.warn('⚠️ [MAILER] ═══════════════════════════════════════════════════════');
    logger.warn('⚠️ [MAILER] EMAIL WILL NOT BE SENT - SMTP NOT CONFIGURED!');
    logger.warn('⚠️ [MAILER] To enable email sending, set these environment variables:');
    logger.warn('⚠️ [MAILER]   - SMTP_USER (your email address)');
    logger.warn('⚠️ [MAILER]   - SMTP_PASS (your email password or app password)');
    logger.warn('⚠️ [MAILER]   - SMTP_HOST (default: smtp.gmail.com)');
    logger.warn('⚠️ [MAILER]   - SMTP_PORT (default: 587)');
    logger.warn('⚠️ [MAILER] ═══════════════════════════════════════════════════════');
    logger.info('📧 [STUB] Email would be sent:', { 
      to, 
      subject,
      from: config.smtp.from,
    });
    logger.info('📧 [STUB] Email content preview:', {
      subject,
      htmlLength: html?.length || 0,
      textPreview: text || (html ? html.replace(/<[^>]*>/g, '').substring(0, 200) : ''),
    });
    logger.info('📧 [STUB] Current SMTP config:', {
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      from: config.smtp.from,
      hasUser: !!config.smtp.auth.user,
      hasPass: !!config.smtp.auth.pass,
    });
    return { messageId: 'stub-' + Date.now() };
  }

  logger.info('📧 [MAILER] SMTP transporter created, sending email...');
  try {
    const mailOptions = {
      from: config.smtp.from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML if text not provided
    };
    
    logger.info('📧 [MAILER] Mail options prepared:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      htmlLength: mailOptions.html?.length || 0,
      textLength: mailOptions.text?.length || 0,
    });

    logger.info('📧 [MAILER] Attempting to send email via SMTP...');
    const info = await mailTransporter.sendMail(mailOptions);

    logger.info('✅ [MAILER] Email sent successfully!', {
      to,
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
      pending: info.pending,
      envelope: info.envelope,
    });
    
    // Detaylı kontrol
    if (info.rejected && info.rejected.length > 0) {
      logger.error('❌ [MAILER] Email was rejected by server:', {
        rejected: info.rejected,
        response: info.response,
      });
    }
    
    if (!info.accepted || info.accepted.length === 0) {
      logger.error('❌ [MAILER] Email was not accepted by server:', {
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
      });
    } else {
      logger.info('✅ [MAILER] Email accepted by server for delivery:', {
        accepted: info.accepted,
        messageId: info.messageId,
      });
    }
    
    return info;
  } catch (error) {
    logger.error('❌ [MAILER] Failed to send email:', {
      to,
      subject,
      error: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      errno: error.errno,
      syscall: error.syscall,
      hostname: error.hostname,
      port: error.port,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });
    throw error;
  }
}

export async function sendOTPEmail({ email, otp, mode, name }) {
  const subject = mode === 'register' 
    ? 'Welcome! Your OTP Code'
    : 'Your OTP Code';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
        .otp-code { font-size: 32px; font-weight: bold; text-align: center; color: #4f46e5; padding: 20px; background-color: white; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${mode === 'register' ? 'Welcome to TaskBoard!' : 'TaskBoard Login'}</h1>
        </div>
        <div class="content">
          ${mode === 'register' && name ? `<p>Hello ${name},</p>` : '<p>Hello,</p>'}
          <p>Your OTP code is:</p>
          <div class="otp-code">${otp}</div>
          <p>This code is valid for <strong>5 minutes</strong>.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} TaskBoard. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function sendTeamInvitationEmail({ email, teamName, inviterName, role, teamId }) {
  logger.info('📧 [MAILER] Preparing team invitation email...', {
    email,
    teamName,
    teamId,
    inviterName,
    role,
    appUrl: config.appUrl,
  });

  const invitationUrl = `${config.appUrl}/teams/${teamId}`;
  const subject = `You've been invited to join ${teamName}`;

  logger.info('📧 [MAILER] Invitation URL generated:', {
    invitationUrl,
    teamId,
    fullUrl: invitationUrl,
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Team Invitation</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p><strong>${inviterName || 'A team admin'}</strong> has invited you to join the team <strong>"${teamName}"</strong> as a <strong>${role}</strong>.</p>
          <p>Click the button below to view the team and accept or reject the invitation:</p>
          <div style="text-align: center;">
            <a href="${invitationUrl}" class="button">View Team</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #6b7280; font-size: 12px; word-break: break-all;">${invitationUrl}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} TaskBoard. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  logger.info('📧 [MAILER] Team invitation email HTML generated', {
    email,
    subject,
    invitationUrl,
    htmlLength: html.length,
  });

  try {
    logger.info('📧 [MAILER] Calling sendEmail function...');
    const result = await sendEmail({ to: email, subject, html });
    
    logger.info('✅ [MAILER] Team invitation email sendEmail completed', {
      email,
      teamName,
      teamId,
      messageId: result?.messageId,
      isStub: result?.messageId?.startsWith('stub-'),
    });
    
    if (result?.messageId?.startsWith('stub-')) {
      logger.warn('⚠️ [MAILER] Email was NOT actually sent - running in STUB mode!');
      logger.warn('⚠️ [MAILER] Check SMTP configuration in .env file');
    } else {
      logger.info('✅ [MAILER] Email was sent to SMTP server', {
        email,
        messageId: result.messageId,
        response: result.response,
      });
    }
    
    return result;
  } catch (error) {
    logger.error('❌ [MAILER] Failed to send team invitation email', {
      email,
      teamName,
      teamId,
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack,
    });
    throw error;
  }
}
