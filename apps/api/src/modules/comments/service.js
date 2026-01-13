import { commentRepository } from './repository.js';
import { publishEvent } from '../../events/publisher.js';
import { getIO } from '../../loaders/socket.js';

export const commentService = {
  async create(data) {
    const comment = await commentRepository.create(data);
    
    // Get task to find projectId
    const task = await commentRepository.getTaskById(data.taskId);
    
    // Publish event
    await publishEvent('comment.added', {
      commentId: comment._id,
      taskId: comment.taskId,
      projectId: task?.projectId,
      userId: comment.userId,
      timestamp: new Date().toISOString(),
    });

    // Emit socket event
    const io = getIO();
    if (task?.projectId) {
      io.to(`project:${task.projectId}`).emit('comment.added', comment);
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
