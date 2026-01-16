import { projectService } from './service.js';

export const projectController = {
  async create(req, res, next) {
    try {
      console.log('📝 Create project - User:', req.user);
      console.log('📝 Create project - Body:', req.body);
      
      // Convert userId to ObjectId
      const mongoose = (await import('mongoose')).default;
      const createdBy = mongoose.Types.ObjectId.isValid(req.user.userId)
        ? new mongoose.Types.ObjectId(req.user.userId)
        : req.user.userId;
      
      // Prepare project data - only include valid project fields
      const projectData = {
        name: req.body.name?.trim(),
        description: req.body.description?.trim() || '',
        status: req.body.status || 'active',
        createdBy,
      };
      
      // Add teamId if provided
      if (req.body.teamId && mongoose.Types.ObjectId.isValid(req.body.teamId)) {
        projectData.teamId = new mongoose.Types.ObjectId(req.body.teamId);
      }
      
      // Add members if provided
      if (req.body.members && Array.isArray(req.body.members)) {
        projectData.members = req.body.members
          .filter(id => mongoose.Types.ObjectId.isValid(id))
          .map(id => new mongoose.Types.ObjectId(id));
      }
      
      // Remove any extra fields that shouldn't be in project data
      // (like 'mode' from auth forms or other unexpected fields)
      delete projectData.mode;
      
      console.log('📝 Cleaned project data:', projectData);
      
      const project = await projectService.create(projectData);
      
      console.log('✅ Project created:', project._id);
      res.status(201).json(project);
    } catch (error) {
      console.error('❌ Create project error:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search, status, teamId } = req.query;
      console.log('📋 Projects getAll - User:', req.user);
      const result = await projectService.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        status,
        teamId,
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
