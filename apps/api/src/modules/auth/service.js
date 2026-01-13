import { authRepository } from './repository.js';
import { generateOTP, verifyOTP } from '../users/service.js';
import { generateTokens, verifyRefreshToken } from '../../utils/jwt.js';
import { publishEvent } from '../../events/publisher.js';
import { getRedisClient } from '../../config/redis.js';
import logger from '../../utils/logger.js';

export const authService = {
  async requestOTP(email, phone, mode = 'login', name = null) {
    const otp = await generateOTP(email, phone);
    
    // Publish OTP requested event to RabbitMQ
    // Note: In production, don't send OTP code in the event payload
    // Worker should generate or retrieve OTP separately for security
    await publishEvent('otp.requested', {
      email,
      phone,
      mode,
      name,
      // In production: Don't send OTP in event, worker should handle it securely
      // For now (stub mode): Sending for logging purposes only
      otp: otp.code,
      timestamp: new Date().toISOString(),
    });

    // Log OTP in API for development/testing
    logger.info(`🔐 OTP Generated for ${email || phone}: ${otp.code} (Mode: ${mode})`);

    const response = {
      message: 'OTP sent successfully',
      expiresIn: 300, // 5 minutes
    };

    // In development mode, include OTP in response for testing
    // ⚠️ REMOVE THIS IN PRODUCTION!
    if (process.env.NODE_ENV === 'development') {
      response.otp = otp.code; // Only for development/testing
      logger.warn('⚠️  DEVELOPMENT MODE: OTP included in response. Remove in production!');
    }

    return response;
  },

  async verifyOTP(email, phone, otp, mode = 'login', name = null) {
    const isValid = await verifyOTP(email, phone, otp);
    
    if (!isValid) {
      throw new Error('Invalid OTP');
    }

    // Find or create user
    let user = await authRepository.findByEmailOrPhone(email, phone);
    
    if (!user) {
      // Create new user for register mode
      if (mode === 'register') {
        user = await authRepository.create({
          email,
          phone,
          name,
          role: 'member', // Default role
        });
      } else {
        // For login mode, if user doesn't exist, create one (backward compatibility)
        user = await authRepository.create({
          email,
          phone,
          role: 'member',
        });
      }
    } else if (mode === 'register') {
      // User already exists, throw error
      throw new Error('User already exists. Please login instead.');
    } else if (name && mode === 'register') {
      // Update name if provided during registration
      user = await authRepository.update(user._id, { name });
    }

    // Generate tokens
    const tokens = generateTokens(user);

    // Store refresh token
    await getRedisClient().setex(
      `refresh:${user._id}`,
      7 * 24 * 60 * 60, // 7 days
      tokens.refreshToken
    );

    return {
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  },

  async refreshToken(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    const storedToken = await getRedisClient().get(`refresh:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    const user = await authRepository.findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const tokens = generateTokens(user);

    // Update refresh token
    await getRedisClient().setex(
      `refresh:${user._id}`,
      7 * 24 * 60 * 60,
      tokens.refreshToken
    );

    return tokens;
  },

  async logout(accessToken, userId) {
    // Blacklist access token
    const jwt = (await import('jsonwebtoken')).default;
    const decoded = jwt.decode(accessToken);
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    
    if (ttl > 0) {
      await getRedisClient().setex(`blacklist:${accessToken}`, ttl, '1');
    }

    // Remove refresh token
    await getRedisClient().del(`refresh:${userId}`);
  },
};
