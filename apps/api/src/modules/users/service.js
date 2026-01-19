import { userRepository } from './repository.js';
import { getRedisClient } from '../../config/redis.js';
import config from '../../config/env.js';
import crypto from 'crypto';

export const userService = {
  async getById(id) {
    return userRepository.findById(id);
  },

  async update(id, data) {
    return userRepository.update(id, data);
  },

  async getSessions(userId) {
    // Get active sessions from Redis
    const keys = await getRedisClient().keys(`refresh:${userId}*`);
    return keys.map(key => ({
      id: key,
      active: true,
    }));
  },

  async generateOTP(email, phone) {
    // Rate limiting check for OTP requests
    const identifier = email || phone;
    const rateLimitKey = `ratelimit:otp:${identifier}`;
    const redis = getRedisClient();
    
    // Check rate limit: max 5 requests per 15 minutes
    const current = await redis.incr(rateLimitKey);
    if (current === 1) {
      await redis.expire(rateLimitKey, 900); // 15 minutes
    }
    
    if (current > 5) {
      throw new Error('Too many OTP requests. Please try again later.');
    }

    // Generate 6-digit OTP
    const code = crypto.randomInt(100000, 999999).toString();
    const key = email ? `otp:email:${email}` : `otp:phone:${phone}`;
    
    // Store OTP in Redis with expiry
    await redis.setex(
      key,
      config.otp.expiry,
      code
    );

    return { code, expiresIn: config.otp.expiry };
  },

  async verifyOTP(email, phone, otp) {
    const key = email ? `otp:email:${email}` : `otp:phone:${phone}`;
    const stored = await getRedisClient().get(key);
    
    if (!stored || stored !== otp) {
      return false;
    }

    // Delete OTP after verification
    await getRedisClient().del(key);
    return true;
  },
};

// Export for use in auth service
export const generateOTP = userService.generateOTP;
export const verifyOTP = userService.verifyOTP;
