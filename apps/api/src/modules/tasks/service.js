import { taskRepository } from './repository.js';
import { publishEvent } from '../../events/publisher.js';
import { getIO } from '../../loaders/socket.js';

export const taskService = {
  async create(data) {
    // Get project to inherit teamId
    const { projectRepository } = await import('../projects/repository.js');
    const project = await projectRepository.findById(data.projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    // Verify user has access to project's team
    if (project.teamId) {
      const { userRepository } = await import('../users/repository.js');
      const user = await userRepository.findById(data.createdBy);
      const userTeamIds = user?.teams
        ?.filter(t => t.status === 'approved')
        .map(t => t.teamId.toString()) || [];
      
      const projectTeamId = project.teamId._id?.toString() || project.teamId.toString();
      
      if (!userTeamIds.includes(projectTeamId)) {
        throw new Error('Forbidden: You must be a member of the project\'s team to create tasks');
      }
    }
    
    // Inherit teamId from project
    const taskData = {
      ...data,
      teamId: project.teamId,
    };
    
    const task = await taskRepository.create(taskData);
    
    // Publish event
    await publishEvent('task.created', {
      taskId: task._id,
      projectId: task.projectId,
      teamId: task.teamId,
      createdBy: task.createdBy,
      assignedTo: task.assignedTo,
      timestamp: new Date().toISOString(),
    });

    // Emit socket event
    const io = getIO();
    if (task.projectId) {
      io.to(`project:${task.projectId}`).emit('task.created', task);
    }
    if (task.teamId) {
      io.to(`team:${task.teamId}`).emit('task.created', task);
    }

    return task;
  },

  async getAll(options) {
    const { page, limit, projectId, status, assignee, search, userId, role, teamId } = options;
    
    const filter = {};
    
    if (projectId) {
      filter.projectId = projectId;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (assignee) {
      filter.assignedTo = assignee;
    }
    
    // Team filter - if teamId is provided, show only tasks in that team
    if (teamId) {
      const mongoose = (await import('mongoose')).default;
      filter.teamId = mongoose.Types.ObjectId.isValid(teamId)
        ? new mongoose.Types.ObjectId(teamId)
        : teamId;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Members can only see tasks from their teams or projects they're part of
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
      // 1. Tasks they created
      // 2. Tasks assigned to them
      // 3. Tasks from teams they belong to (approved status)
      const memberTasks = {
        $or: [
          { createdBy: userIdObj },
          { assignedTo: userIdObj },
          ...(userTeamIds.length > 0 ? [{ teamId: { $in: userTeamIds } }] : []),
        ],
      };
      
      // Combine with search filter if exists
      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or }, // search filter
          memberTasks,         // member filter
        ];
        delete filter.$or;
      } else {
        Object.assign(filter, memberTasks);
      }
    }

    const skip = (page - 1) * limit;
    
    const [tasks, total] = await Promise.all([
      taskRepository.find(filter, { skip, limit }),
      taskRepository.count(filter),
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id, userId) {
    const task = await taskRepository.findById(id);
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Check if user has access to this task's team
    if (task.teamId) {
      const { userRepository } = await import('../users/repository.js');
      const user = await userRepository.findById(userId);
      const userTeamIds = user?.teams
        ?.filter(t => t.status === 'approved')
        .map(t => t.teamId.toString()) || [];
      
      const taskTeamId = task.teamId._id?.toString() || task.teamId.toString();
      
      if (!userTeamIds.includes(taskTeamId)) {
        throw new Error('Forbidden: You do not have access to this task');
      }
    }
    
    return task;
  },

  async update(id, data, userId, role) {
    const task = await taskRepository.findById(id);
    
    if (!task) {
      throw new Error('Task not found');
    }

    // Check permissions
    if (role !== 'admin' && task.createdBy.toString() !== userId) {
      throw new Error('Forbidden');
    }

    const updated = await taskRepository.update(id, data);

    // Publish event if assigned
    if (data.assignedTo && data.assignedTo !== task.assignedTo?.toString()) {
      await publishEvent('task.assigned', {
        taskId: task._id,
        projectId: task.projectId,
        assignedTo: data.assignedTo,
        timestamp: new Date().toISOString(),
      });

      const io = getIO();
      io.to(`project:${task.projectId}`).emit('task.assigned', updated);
      if (task.teamId) {
        io.to(`team:${task.teamId}`).emit('task.assigned', updated);
      }
    }

    // Emit update event
    const io = getIO();
    io.to(`project:${task.projectId}`).emit('task.updated', updated);
    if (task.teamId) {
      io.to(`team:${task.teamId}`).emit('task.updated', updated);
    }

    return updated;
  },

  async delete(id, userId, role) {
    const task = await taskRepository.findById(id);
    
    if (!task) {
      throw new Error('Task not found');
    }

    if (role !== 'admin' && task.createdBy.toString() !== userId) {
      throw new Error('Forbidden');
    }

    return taskRepository.delete(id);
  },
};
