import { projectRepository } from './repository.js';

export const projectService = {
  async create(data) {
    console.log('📝 ProjectService.create - Data:', data);
    
    // Validate required fields
    if (!data.name || !data.name.trim()) {
      throw new Error('Project name is required');
    }
    
    // Ensure createdBy is ObjectId
    const mongoose = (await import('mongoose')).default;
    if (data.createdBy) {
      if (!mongoose.Types.ObjectId.isValid(data.createdBy)) {
        throw new Error(`Invalid createdBy field: ${data.createdBy}`);
      }
      // Ensure it's an ObjectId instance
      if (!(data.createdBy instanceof mongoose.Types.ObjectId)) {
        data.createdBy = new mongoose.Types.ObjectId(data.createdBy);
      }
    } else {
      throw new Error('createdBy is required');
    }
    
    // Validate teamId if provided
    if (data.teamId) {
      if (!mongoose.Types.ObjectId.isValid(data.teamId)) {
        throw new Error(`Invalid teamId field: ${data.teamId}`);
      }
      data.teamId = new mongoose.Types.ObjectId(data.teamId);
      
      // Verify user is team admin (only team admins can create projects)
      const { teamRepository } = await import('../teams/repository.js');
      const { isTeamAdmin } = await import('../teams/helpers.js');
      const team = await teamRepository.findById(data.teamId);
      
      if (!team) {
        throw new Error('Team not found');
      }
      
      if (!isTeamAdmin(team, data.createdBy)) {
        throw new Error('Forbidden: Only team admins can create projects in a team');
      }
    }
    
    try {
      const project = await projectRepository.create(data);
      console.log('✅ ProjectService.create - Success:', project._id);
      return project;
    } catch (error) {
      console.error('❌ ProjectService.create - Error:', error);
      throw error;
    }
  },

  async getAll(options) {
    const { page, limit, search, status, userId, role, teamId } = options;
    
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
    
    // Team filter - if teamId is provided, show only projects in that team
    if (teamId) {
      const mongoose = (await import('mongoose')).default;
      filter.teamId = mongoose.Types.ObjectId.isValid(teamId)
        ? new mongoose.Types.ObjectId(teamId)
        : teamId;
    }
    
    // Members can only see projects from their teams or projects they created
    if (role === 'member' && userId) {
      const mongoose = (await import('mongoose')).default;
      const userIdObj = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;
      
      // Get user's teams
      const { userRepository } = await import('../users/repository.js');
      const user = await userRepository.findById(userId);
      const userTeamIds = user?.teams
        ?.filter(t => t.status === 'approved')
        .map(t => t.teamId) || [];
      
      // Member can see:
      // 1. Projects they created
      // 2. Projects they are members of
      // 3. Projects from teams they belong to (approved status)
      const memberProjects = {
        $or: [
          { createdBy: userIdObj },
          { members: userIdObj },
          ...(userTeamIds.length > 0 ? [{ teamId: { $in: userTeamIds } }] : []),
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
    const project = await projectRepository.findById(id);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    // Check if user has access to this project's team
    if (project.teamId) {
      const { userRepository } = await import('../users/repository.js');
      const user = await userRepository.findById(userId);
      const userTeamIds = user?.teams
        ?.filter(t => t.status === 'approved')
        .map(t => t.teamId.toString()) || [];
      
      const projectTeamId = project.teamId._id?.toString() || project.teamId.toString();
      
      if (!userTeamIds.includes(projectTeamId)) {
        throw new Error('Forbidden: You do not have access to this project');
      }
    }
    
    return project;
  },

  async update(id, data, userId, role) {
    const project = await projectRepository.findById(id);
    
    if (!project) {
      throw new Error('Project not found');
    }

    // Check permissions
    // Admin can update any project
    // Members can only update projects they created
    const projectCreatorId = project.createdBy?._id?.toString() || project.createdBy?.toString();
    const currentUserId = userId?.toString();
    
    if (role !== 'admin' && projectCreatorId !== currentUserId) {
      throw new Error('Forbidden: You can only update projects you created');
    }
    
    // Validate teamId if provided
    if (data.teamId) {
      const mongoose = (await import('mongoose')).default;
      if (!mongoose.Types.ObjectId.isValid(data.teamId)) {
        throw new Error(`Invalid teamId field: ${data.teamId}`);
      }
      data.teamId = new mongoose.Types.ObjectId(data.teamId);
      
      // Verify user is member of the team
      const { userRepository } = await import('../users/repository.js');
      const user = await userRepository.findById(userId);
      const userTeamIds = user?.teams
        ?.filter(t => t.status === 'approved')
        .map(t => t.teamId.toString()) || [];
      
      if (!userTeamIds.includes(data.teamId.toString())) {
        throw new Error('Forbidden: You must be a member of the team to assign projects to it');
      }
    }

    return projectRepository.update(id, data);
  },

  async delete(id, userId, role) {
    const project = await projectRepository.findById(id);
    
    if (!project) {
      throw new Error('Project not found');
    }

    // Check permissions
    const mongoose = (await import('mongoose')).default;
    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    
    const projectCreatorId = project.createdBy?._id?.toString() || project.createdBy?.toString();
    const currentUserId = userIdObj.toString();
    
    // Admin can delete any project
    // Members can only delete projects they created
    if (role !== 'admin' && projectCreatorId !== currentUserId) {
      throw new Error('Forbidden: You can only delete projects you created');
    }

    // Cascade delete: Delete all tasks and comments associated with this project
    const projectIdObj = mongoose.Types.ObjectId.isValid(id)
      ? new mongoose.Types.ObjectId(id)
      : id;
    
    const { Task } = await import('../tasks/repository.js');
    const { Comment } = await import('../comments/repository.js');
    
    // Delete all comments for tasks in this project
    const tasks = await Task.find({ projectId: projectIdObj }).select('_id');
    const taskIds = tasks.map(t => t._id);
    
    if (taskIds.length > 0) {
      await Comment.deleteMany({ taskId: { $in: taskIds } });
    }
    
    // Delete all tasks in this project
    await Task.deleteMany({ projectId: projectIdObj });

    // Delete the project
    return projectRepository.delete(id);
  },
};
