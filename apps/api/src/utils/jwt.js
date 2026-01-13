import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export function generateTokens(user) {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiry,
  });

  const refreshToken = jwt.sign(
    { userId: user._id.toString() },
    config.jwt.secret,
    {
      expiresIn: config.jwt.refreshExpiry,
    }
  );

  return { accessToken, refreshToken };
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.secret);
}
