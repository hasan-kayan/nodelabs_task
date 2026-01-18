import { teamRepository } from './repository.js';
import { userRepository } from '../users/repository.js';
import { publishEvent } from '../../events/publisher.js';
import logger from '../../utils/logger.js';

export const teamService = {
  async create(data) {
    const mongoose = (await import('mongoose')).default;
    
    // Create team with creator as admin member
    const teamData = {
      name: data.name.trim(),
      description: data.description?.trim() || '',
      createdBy: new mongoose.Types.ObjectId(data.createdBy),
      members: [{
        user: new mongoose.Types.ObjectId(data.createdBy),
        role: 'admin',
        status: 'approved',
        joinedAt: new Date(),
      }],
    };
    
    const team = await teamRepository.create(teamData);
    
    // Update user's teams array
    await this.addTeamToUser(data.createdBy, team._id, 'admin', 'approved');
    
    logger.info(`✅ Team created: ${team._id} by user ${data.createdBy}`);
    return team;
  },

  async getAll(options) {
    const { page, limit, userId, role } = options;
    
    const filter = {};
    
    // Members can only see teams they're part of
    if (role === 'member' && userId) {
      const mongoose = (await import('mongoose')).default;
      const userIdObj = mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;
      
      filter.$or = [
        { createdBy: userIdObj },
        { 'members.user': userIdObj },
      ];
    }
    // Admin can see all teams (no filter)

    const skip = (page - 1) * limit;
    
    const [teams, total] = await Promise.all([
      teamRepository.find(filter, { skip, limit }),
      teamRepository.count(filter),
    ]);

    return {
      teams,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id, userId) {
    const team = await teamRepository.findById(id);
    
    if (!team) {
      throw new Error('Team not found');
    }
    
    // Check if user has access to this team
    const mongoose = (await import('mongoose')).default;
    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    
    const isCreator = team.createdBy._id.toString() === userIdObj.toString();
    const isMember = team.members.some(
      m => m.user._id.toString() === userIdObj.toString()
    );
    
    if (!isCreator && !isMember) {
      throw new Error('Forbidden: You do not have access to this team');
    }
    
    return team;
  },

  async update(id, data, userId, role) {
    const team = await teamRepository.findById(id);
    
    if (!team) {
      throw new Error('Team not found');
    }
    
    // Check permissions - only team admin or system admin can update
    const mongoose = (await import('mongoose')).default;
    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    
    const isTeamAdmin = team.members.some(
      m => m.user._id.toString() === userIdObj.toString() && m.role === 'admin'
    );
    const isCreator = team.createdBy._id.toString() === userIdObj.toString();
    
    if (role !== 'admin' && !isTeamAdmin && !isCreator) {
      throw new Error('Forbidden: Only team admins can update team');
    }
    
    const updateData = {};
    if (data.name) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description.trim();
    
    return teamRepository.update(id, updateData);
  },

  async delete(id, userId, role) {
    const team = await teamRepository.findById(id);
    
    if (!team) {
      throw new Error('Team not found');
    }
    
    // Only system admin or team creator can delete
    const mongoose = (await import('mongoose')).default;
    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    
    const isCreator = team.createdBy._id.toString() === userIdObj.toString();
    
    if (role !== 'admin' && !isCreator) {
      throw new Error('Forbidden: Only team creator can delete team');
    }
    
    // Remove team from all users
    for (const member of team.members) {
      await this.removeTeamFromUser(member.user._id, id);
    }
    
    return teamRepository.delete(id);
  },

  async inviteMember(teamId, email, invitedBy, role = 'member') {
    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }
    
    // Check if inviter is team admin
    const mongoose = (await import('mongoose')).default;
    const inviterId = mongoose.Types.ObjectId.isValid(invitedBy)
      ? new mongoose.Types.ObjectId(invitedBy)
      : invitedBy;
    
    // Handle both populated and non-populated createdBy
    const createdById = team.createdBy?._id?.toString() || team.createdBy?.toString();
    
    // Check if inviter is team admin or creator
    const isTeamAdmin = team.members.some(m => {
      const memberUserId = m.user?._id?.toString() || m.user?.toString();
      return memberUserId === inviterId.toString() && m.role === 'admin' && m.status === 'approved';
    });
    const isCreator = createdById === inviterId.toString();
    
    if (!isTeamAdmin && !isCreator) {
      throw new Error('Forbidden: Only team admins can invite members');
    }
    
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error(`User not found with email: ${email}`);
    }
    
    // Check if user is already a member
    const existingMember = team.members.find(m => {
      const memberUserId = m.user?._id?.toString() || m.user?.toString();
      return memberUserId === user._id.toString();
    });
    
    if (existingMember) {
      throw new Error('User is already a member of this team');
    }
    
    // Add member to team
    await teamRepository.addMember(teamId, {
      user: user._id,
      role,
      status: 'pending',
      invitedBy: inviterId,
    });
    
    // Add team to user's teams array
    await this.addTeamToUser(user._id, teamId, role, 'pending', inviterId);
    
    // Get inviter name for email
    const inviter = await userRepository.findById(inviterId);
    const inviterName = inviter?.name || 'A team admin';
    
    logger.info('📧 [TEAM SERVICE] Preparing to publish invitation event...', {
      teamId: teamId.toString(),
      teamName: team.name,
      userId: user._id.toString(),
      userEmail: user.email,
      invitedBy: inviterId.toString(),
      inviterName,
      role,
    });
    
    // Publish invitation event
    const eventData = {
      teamId: teamId.toString(),
      teamName: team.name,
      userId: user._id.toString(),
      userEmail: user.email,
      invitedBy: inviterId.toString(),
      inviterName,
      role,
      timestamp: new Date().toISOString(),
    };
    
    logger.info('📧 [TEAM SERVICE] Publishing invitation event with data:', eventData);
    
    try {
      await publishEvent('team.invitation', eventData);
      logger.info(`✅ [TEAM SERVICE] Invitation event published successfully: ${team.name} -> ${email}`);
    } catch (error) {
      logger.error('❌ [TEAM SERVICE] Failed to publish invitation event:', {
        error: error.message,
        stack: error.stack,
        eventData,
      });
      throw error;
    }
    
    logger.info(`📧 [TEAM SERVICE] Team invitation process completed: ${team.name} -> ${email}`);
    
    return { message: 'Invitation sent successfully' };
  },

  async approveMember(teamId, userId, approverId, role) {
    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }
    
    // Check if approver is team admin
    const mongoose = (await import('mongoose')).default;
    const approverIdObj = mongoose.Types.ObjectId.isValid(approverId)
      ? new mongoose.Types.ObjectId(approverId)
      : approverId;
    
    const isTeamAdmin = team.members.some(
      m => m.user._id.toString() === approverIdObj.toString() && m.role === 'admin'
    );
    const isCreator = team.createdBy._id.toString() === approverIdObj.toString();
    
    if (role !== 'admin' && !isTeamAdmin && !isCreator) {
      throw new Error('Forbidden: Only team admins can approve members');
    }
    
    // Update member status
    await teamRepository.updateMemberStatus(teamId, userId, 'approved');
    
    // Update user's teams array
    await this.updateUserTeamStatus(userId, teamId, 'approved');
    
    // Publish approval event
    await publishEvent('team.member.approved', {
      teamId: teamId.toString(),
      teamName: team.name,
      userId: userId.toString(),
      timestamp: new Date().toISOString(),
    });
    
    logger.info(`✅ Team member approved: ${userId} in team ${teamId}`);
    
    return { message: 'Member approved successfully' };
  },

  async rejectMember(teamId, userId, rejecterId, role) {
    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }
    
    // Check if rejecter is team admin
    const mongoose = (await import('mongoose')).default;
    const rejecterIdObj = mongoose.Types.ObjectId.isValid(rejecterId)
      ? new mongoose.Types.ObjectId(rejecterId)
      : rejecterId;
    
    const isTeamAdmin = team.members.some(
      m => m.user._id.toString() === rejecterIdObj.toString() && m.role === 'admin'
    );
    const isCreator = team.createdBy._id.toString() === rejecterIdObj.toString();
    
    if (role !== 'admin' && !isTeamAdmin && !isCreator) {
      throw new Error('Forbidden: Only team admins can reject members');
    }
    
    // Remove member from team
    await teamRepository.removeMember(teamId, userId);
    
    // Remove team from user's teams array
    await this.removeTeamFromUser(userId, teamId);
    
    logger.info(`❌ Team member rejected: ${userId} from team ${teamId}`);
    
    return { message: 'Member rejected successfully' };
  },

  // User accepts their own invitation
  async acceptInvitation(teamId, userId) {
    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }
    
    const mongoose = (await import('mongoose')).default;
    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    
    // Find the pending invitation
    const member = team.members.find(m => {
      const memberUserId = m.user?._id?.toString() || m.user?.toString();
      return memberUserId === userIdObj.toString() && m.status === 'pending';
    });
    
    if (!member) {
      throw new Error('No pending invitation found for this user');
    }
    
    // Update member status to approved
    await teamRepository.updateMemberStatus(teamId, userId, 'approved');
    
    // Update user's teams array
    await this.updateUserTeamStatus(userId, teamId, 'approved');
    
    // Publish approval event
    await publishEvent('team.member.approved', {
      teamId: teamId.toString(),
      teamName: team.name,
      userId: userId.toString(),
      timestamp: new Date().toISOString(),
    });
    
    logger.info(`✅ User ${userId} accepted invitation to team ${teamId}`);
    
    return { message: 'Invitation accepted successfully' };
  },

  // User rejects their own invitation
  async rejectInvitation(teamId, userId) {
    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }
    
    const mongoose = (await import('mongoose')).default;
    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    
    // Find the pending invitation
    const member = team.members.find(m => {
      const memberUserId = m.user?._id?.toString() || m.user?.toString();
      return memberUserId === userIdObj.toString() && m.status === 'pending';
    });
    
    if (!member) {
      throw new Error('No pending invitation found for this user');
    }
    
    // Remove member from team
    await teamRepository.removeMember(teamId, userId);
    
    // Remove team from user's teams array
    await this.removeTeamFromUser(userId, teamId);
    
    logger.info(`❌ User ${userId} rejected invitation to team ${teamId}`);
    
    return { message: 'Invitation rejected successfully' };
  },

  // Helper methods for user-team relationship
  async addTeamToUser(userId, teamId, role, status, invitedBy = null) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if team already exists in user's teams
    const existingTeam = user.teams?.find(
      t => t.teamId.toString() === teamId.toString()
    );
    
    if (existingTeam) {
      return; // Already exists
    }
    
    const mongoose = (await import('mongoose')).default;
    const teamData = {
      teamId: mongoose.Types.ObjectId.isValid(teamId)
        ? new mongoose.Types.ObjectId(teamId)
        : teamId,
      role,
      status,
    };
    
    if (invitedBy) {
      teamData.invitedBy = mongoose.Types.ObjectId.isValid(invitedBy)
        ? new mongoose.Types.ObjectId(invitedBy)
        : invitedBy;
    }
    
    if (status === 'approved') {
      teamData.joinedAt = new Date();
    }
    
    if (!user.teams) {
      user.teams = [];
    }
    
    user.teams.push(teamData);
    await user.save();
  },

  async updateUserTeamStatus(userId, teamId, status) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const team = user.teams?.find(
      t => t.teamId.toString() === teamId.toString()
    );
    
    if (team) {
      team.status = status;
      if (status === 'approved' && !team.joinedAt) {
        team.joinedAt = new Date();
      }
      await user.save();
    }
  },

  async removeTeamFromUser(userId, teamId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      return; // User might not exist
    }
    
    if (user.teams) {
      user.teams = user.teams.filter(
        t => t.teamId.toString() !== teamId.toString()
      );
      await user.save();
    }
  },
};
