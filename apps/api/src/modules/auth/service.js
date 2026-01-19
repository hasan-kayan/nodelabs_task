import { authRepository } from './repository.js';
import { userRepository } from '../users/repository.js';
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

    // For login mode: user must exist and email/phone must match
    if (mode === 'login') {
      // Check if both email and phone are provided
      if (email && phone) {
        // Both provided: find user where both match exactly
        const user = await authRepository.findByEmailAndPhone(email, phone);
        if (!user) {
          throw new Error('User not found. Please register first.');
        }
        
        // Verify that the found user has both email and phone matching
        if (user.email !== email || user.phone !== phone) {
          throw new Error('Email and phone number do not match. Please use the correct combination.');
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
      } else {
        // Only email or only phone provided: find user and verify
        const user = await authRepository.findByEmailOrPhone(email, phone);
        if (!user) {
          throw new Error('User not found. Please register first.');
        }
        
        // Verify the provided credential matches
        if (email && user.email !== email) {
          throw new Error('Email does not match. Please use the correct email.');
        }
        if (phone && user.phone !== phone) {
          throw new Error('Phone number does not match. Please use the correct phone number.');
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
      }
    }

    // For register mode: create new user
    if (mode === 'register') {
      // Both email and phone are required for registration (validated in middleware)
      if (!email || !phone) {
        throw new Error('Both email and phone number are required for registration.');
      }
      
      // Check if email is already taken
      const userWithEmail = await userRepository.findByEmail(email);
      if (userWithEmail) {
        throw new Error('Email is already registered. Please login instead.');
      }
      
      // Check if phone is already taken
      const userWithPhone = await userRepository.findByPhone(phone);
      if (userWithPhone) {
        throw new Error('Phone number is already registered. Please login instead.');
      }
      
      // Check if a user exists with both email and phone (exact match)
      const existingUser = await authRepository.findByEmailAndPhone(email, phone);
      if (existingUser) {
        throw new Error('User already exists. Please login instead.');
      }
      
      // Create new user
      const user = await authRepository.create({
        email,
        phone,
        name,
        role: 'member', // Default role
      });

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
    }
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
