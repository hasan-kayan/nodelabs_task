import { taskService } from './service.js';

export const taskController = {
  async create(req, res, next) {
    try {
      const task = await taskService.create({
        ...req.body,
        createdBy: req.user.userId,
      });
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, projectId, status, assignee, search } = req.query;
      const result = await taskService.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        projectId,
        status,
        assignee,
        search,
        userId: req.user.userId,
        role: req.user.role,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const task = await taskService.getById(req.params.id, req.user.id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const task = await taskService.update(
        req.params.id,
        req.body,
        req.user.userId,
        req.user.role
      );
      res.json(task);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await taskService.delete(req.params.id, req.user.id, req.user.role);
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
