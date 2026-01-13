import { getRedisClient } from '../config/redis.js';
import config from '../config/env.js';
import logger from '../utils/logger.js';

export function rateLimit(options = {}) {
  const windowMs = options.windowMs || config.rateLimit.windowMs;
  const maxRequests = options.maxRequests || config.rateLimit.maxRequests;

  return async (req, res, next) => {
    try {
      const key = `ratelimit:${options.key || req.ip}:${req.user?.id || 'anonymous'}`;
      const redis = getRedisClient();

      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }

      if (current > maxRequests) {
        logger.warn(`Rate limit exceeded for ${key}`);
        return res.status(429).json({ 
          error: 'Too many requests',
          retryAfter: Math.ceil(windowMs / 1000),
        });
      }

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));

      next();
    } catch (error) {
      logger.error('Rate limit error:', error);
      next(); // Continue on error
    }
  };
}
