import { projectRepository } from './repository.js';

export const projectService = {
  async create(data) {
    return projectRepository.create(data);
  },

  async getAll(options) {
    const { page, limit, search, status, userId, role } = options;
    
    const filter = {};
    
    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Status filter
    if (status) {
      filter.status = status;
    }
    
    // Members can only see projects they're part of
    if (role === 'member' && userId) {
      const mongoose = (await import('mongoose')).default;
      const userIdObj = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;
      
      // Member can see projects they created or are members of
      const memberProjects = {
        $or: [
          { createdBy: userIdObj },
          { members: userIdObj },
        ],
      };
      
      // Combine with search filter if exists
      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or }, // search filter
          memberProjects,      // member filter
        ];
        delete filter.$or;
      } else {
        Object.assign(filter, memberProjects);
      }
    }
    // Admin can see all projects (no additional filter)

    const skip = (page - 1) * limit;
    
    const [projects, total] = await Promise.all([
      projectRepository.find(filter, { skip, limit }),
      projectRepository.count(filter),
    ]);

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id, userId) {
    return projectRepository.findById(id);
  },

  async update(id, data, userId, role) {
    const project = await projectRepository.findById(id);
    
    if (!project) {
      throw new Error('Project not found');
    }

    // Check permissions
    if (role !== 'admin' && project.createdBy.toString() !== userId) {
      throw new Error('Forbidden');
    }

    return projectRepository.update(id, data);
  },

  async delete(id, userId, role) {
    const project = await projectRepository.findById(id);
    
    if (!project) {
      throw new Error('Project not found');
    }

    if (role !== 'admin' && project.createdBy.toString() !== userId) {
      throw new Error('Forbidden');
    }

    return projectRepository.delete(id);
  },
};
