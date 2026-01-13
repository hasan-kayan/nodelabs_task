import { projectService } from './service.js';

export const projectController = {
  async create(req, res, next) {
    try {
      const project = await projectService.create({
        ...req.body,
        createdBy: req.user.userId, // JWT contains 'userId' field
      });
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search, status } = req.query;
      console.log('📋 Projects getAll - User:', req.user);
      const result = await projectService.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        status,
        userId: req.user.userId, // JWT contains 'userId' field
        role: req.user.role,
      });
      console.log('✅ Projects result:', { count: result.projects?.length, total: result.pagination?.total });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const project = await projectService.getById(req.params.id, req.user.userId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const project = await projectService.update(
        req.params.id,
        req.body,
        req.user.userId,
        req.user.role
      );
      res.json(project);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await projectService.delete(req.params.id, req.user.userId, req.user.role);
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
