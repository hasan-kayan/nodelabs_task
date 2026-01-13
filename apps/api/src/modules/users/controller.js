import { userService } from './service.js';

export const userController = {
  async getProfile(req, res, next) {
    try {
      const user = await userService.getById(req.user.userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const user = await userService.update(req.user.userId, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async getSessions(req, res, next) {
    try {
      const sessions = await userService.getSessions(req.user.userId);
      res.json(sessions);
    } catch (error) {
      next(error);
    }
  },
};
