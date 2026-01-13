import { authService } from './service.js';

export const authController = {
  async requestOTP(req, res, next) {
    try {
      const { email, phone, mode, name } = req.body;
      const result = await authService.requestOTP(email, phone, mode, name);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async verifyOTP(req, res, next) {
    try {
      const { email, phone, otp, mode, name } = req.body;
      const result = await authService.verifyOTP(email, phone, otp, mode, name);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      const token = req.headers.authorization?.substring(7);
      await authService.logout(token, req.user.userId);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  },
};
