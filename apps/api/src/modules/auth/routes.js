import express from 'express';
import { authController } from './controller.js';
import { validate } from '../../middlewares/validate.js';
import { rateLimit } from '../../middlewares/ratelimit.js';
import {
  requestOTPSchema,
  verifyOTPSchema,
  refreshTokenSchema,
} from './validators.js';

const router = express.Router();

// OTP request with rate limiting
router.post(
  '/otp/request', 
  rateLimit({ 
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // Max 5 OTP requests
    key: 'otp'
  }),
  validate(requestOTPSchema), 
  authController.requestOTP
);

// OTP verify with rate limiting
router.post(
  '/otp/verify', 
  rateLimit({ 
    windowMs: 15 * 60 * 1000,
    maxRequests: 10, // Max 10 verification attempts
    key: 'otp-verify'
  }),
  validate(verifyOTPSchema), 
  authController.verifyOTP
);

// Refresh token
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

// Logout (requires authentication)
router.post('/logout', authController.logout);

export default router;
