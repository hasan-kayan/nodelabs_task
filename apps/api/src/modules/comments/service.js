import { commentRepository } from './repository.js';
import { publishEvent } from '../../events/publisher.js';
import { getIO } from '../../loaders/socket.js';
import { isTeamAdmin, isTeamMember } from '../teams/helpers.js';

export const commentService = {
  async create(data) {
    // Get task to verify access
    const task = await commentRepository.getTaskById(data.taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Verify user has access to task's team
    // Team admins and team members can add comments
    if (task.teamId) {
      const { teamRepository } = await import('../teams/repository.js');
      const team = await teamRepository.findById(task.teamId);
      
      if (!team) {
        throw new Error('Team not found');
      }
      
      const isAdmin = isTeamAdmin(team, data.userId);
      const isMember = isTeamMember(team, data.userId);
      
      if (!isAdmin && !isMember) {
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

    // Comment creator can update their own comments
    // Team admin can update comments in their team
    const isCreator = comment.userId.toString() === userId.toString();
    let isTeamAdminUser = false;
    
    // Get task to check team
    const task = await commentRepository.getTaskById(comment.taskId);
    if (task?.teamId && !isCreator) {
      const { teamRepository } = await import('../teams/repository.js');
      const team = await teamRepository.findById(task.teamId);
      if (team) {
        isTeamAdminUser = isTeamAdmin(team, userId);
      }
    }
    
    if (!isCreator && !isTeamAdminUser) {
      throw new Error('Forbidden: Only comment creator or team admin can update comments');
    }

    return commentRepository.update(id, data);
  },

  async delete(id, userId) {
    const comment = await commentRepository.findById(id);
    
    if (!comment) {
      throw new Error('Comment not found');
    }

    // Comment creator can delete their own comments
    // Team admin can delete comments in their team
    const isCreator = comment.userId.toString() === userId.toString();
    let isTeamAdminUser = false;
    
    // Get task to check team
    const task = await commentRepository.getTaskById(comment.taskId);
    if (task?.teamId && !isCreator) {
      const { teamRepository } = await import('../teams/repository.js');
      const team = await teamRepository.findById(task.teamId);
      if (team) {
        isTeamAdminUser = isTeamAdmin(team, userId);
      }
    }
    
    if (!isCreator && !isTeamAdminUser) {
      throw new Error('Forbidden: Only comment creator or team admin can delete comments');
    }

    return commentRepository.delete(id);
  },
};
