import { commentRepository } from './repository.js';
import { publishEvent } from '../../events/publisher.js';
import { getIO } from '../../loaders/socket.js';

export const commentService = {
  async create(data) {
    // Get task to verify access
    const task = await commentRepository.getTaskById(data.taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Verify user has access to task's team
    if (task.teamId) {
      const { userRepository } = await import('../users/repository.js');
      const user = await userRepository.findById(data.userId);
      const userTeamIds = user?.teams
        ?.filter(t => t.status === 'approved')
        .map(t => t.teamId.toString()) || [];
      
      const taskTeamId = task.teamId._id?.toString() || task.teamId.toString();
      
      if (!userTeamIds.includes(taskTeamId)) {
        throw new Error('Forbidden: You must be a member of the task\'s team to add comments');
      }
    }
    
    const comment = await commentRepository.create(data);
    
    // Publish event
    await publishEvent('comment.added', {
      commentId: comment._id,
      taskId: comment.taskId,
      projectId: task?.projectId,
      teamId: task?.teamId,
      userId: comment.userId,
      timestamp: new Date().toISOString(),
    });

    // Emit socket event
    const io = getIO();
    if (task?.projectId) {
      io.to(`project:${task.projectId}`).emit('comment.added', comment);
    }
    if (task?.teamId) {
      io.to(`team:${task.teamId}`).emit('comment.added', comment);
    }

    return comment;
  },

  async getByTask(taskId) {
    return commentRepository.findByTask(taskId);
  },

  async update(id, data, userId) {
    const comment = await commentRepository.findById(id);
    
    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId.toString() !== userId) {
      throw new Error('Forbidden');
    }

    return commentRepository.update(id, data);
  },

  async delete(id, userId) {
    const comment = await commentRepository.findById(id);
    
    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId.toString() !== userId) {
      throw new Error('Forbidden');
    }

    return commentRepository.delete(id);
  },
};
