import { teamService } from './service.js';

export const teamController = {
  async create(req, res, next) {
    try {
      const mongoose = (await import('mongoose')).default;
      const createdBy = mongoose.Types.ObjectId.isValid(req.user.userId)
        ? new mongoose.Types.ObjectId(req.user.userId)
        : req.user.userId;
      
      const team = await teamService.create({
        ...req.body,
        createdBy,
      });
      
      res.status(201).json(team);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await teamService.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
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
      const team = await teamService.getById(req.params.id, req.user.userId);
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      res.json(team);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const team = await teamService.update(
        req.params.id,
        req.body,
        req.user.userId,
        req.user.role
      );
      res.json(team);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await teamService.delete(req.params.id, req.user.userId, req.user.role);
      res.json({ message: 'Team deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async inviteMember(req, res, next) {
    try {
      const { email, role } = req.body;
      const result = await teamService.inviteMember(
        req.params.id,
        email,
        req.user.userId,
        role || 'member'
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async approveMember(req, res, next) {
    try {
      const { userId } = req.body;
      const result = await teamService.approveMember(
        req.params.id,
        userId,
        req.user.userId,
        req.user.role
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async rejectMember(req, res, next) {
    try {
      const { userId } = req.body;
      const result = await teamService.rejectMember(
        req.params.id,
        userId,
        req.user.userId,
        req.user.role
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
