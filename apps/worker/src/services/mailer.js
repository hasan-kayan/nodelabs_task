import nodemailer from 'nodemailer';
import config from '../config/env.js';
import logger from '../utils/logger.js';

// Create reusable transporter
let transporter = null;

function createTransporter() {
  if (transporter) {
    return transporter;
  }

  // If SMTP is not configured, return null (will use stub mode)
  if (!config.smtp.auth.user || !config.smtp.auth.pass) {
    logger.warn('⚠️ SMTP not configured. Email sending will be stubbed.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure, // true for 465, false for other ports
    auth: {
      user: config.smtp.auth.user,
      pass: config.smtp.auth.pass,
    },
  });

  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  const mailTransporter = createTransporter();

  if (!mailTransporter) {
    // Stub mode: just log
    logger.info('📧 [STUB] Email would be sent:', { to, subject });
    return { messageId: 'stub-' + Date.now() };
  }

  try {
    const info = await mailTransporter.sendMail({
      from: config.smtp.from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML if text not provided
    });

    logger.info(`✅ Email sent successfully: ${to} (${info.messageId})`);
    return info;
  } catch (error) {
    logger.error('❌ Failed to send email:', error);
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
  const invitationUrl = `${config.appUrl}/teams/${teamId}`;
  const subject = `You've been invited to join ${teamName}`;

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

  return sendEmail({ to: email, subject, html });
}
