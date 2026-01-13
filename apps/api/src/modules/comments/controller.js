import { commentService } from './service.js';

export const commentController = {
  async create(req, res, next) {
    try {
      const comment = await commentService.create({
        ...req.body,
        userId: req.user.userId,
      });
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  },

  async getByTask(req, res, next) {
    try {
      const comments = await commentService.getByTask(req.params.taskId);
      res.json(comments);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const comment = await commentService.update(
        req.params.id,
        req.body,
        req.user.userId
      );
      res.json(comment);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await commentService.delete(req.params.id, req.user.id);
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
