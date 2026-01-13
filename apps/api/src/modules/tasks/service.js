import { taskRepository } from './repository.js';
import { publishEvent } from '../../events/publisher.js';
import { getIO } from '../../loaders/socket.js';

export const taskService = {
  async create(data) {
    const task = await taskRepository.create(data);
    
    // Publish event
    await publishEvent('task.created', {
      taskId: task._id,
      projectId: task.projectId,
      createdBy: task.createdBy,
      assignedTo: task.assignedTo,
      timestamp: new Date().toISOString(),
    });

    // Emit socket event
    const io = getIO();
    io.to(`project:${task.projectId}`).emit('task.created', task);

    return task;
  },

  async getAll(options) {
    const { page, limit, projectId, status, assignee, search, userId, role } = options;
    
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
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Members can only see tasks from their projects
    if (role === 'member') {
      // This would need project membership check
      // Simplified for now
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
    return taskRepository.findById(id);
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
    }

    // Emit update event
    const io = getIO();
    io.to(`project:${task.projectId}`).emit('task.updated', updated);

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
