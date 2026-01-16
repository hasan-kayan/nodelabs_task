import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    joinedAt: Date,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

teamSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Prevent duplicate model compilation
export const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);

export const teamRepository = {
  async create(data) {
    return Team.create(data);
  },

  async findById(id) {
    return Team.findById(id)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email')
      .populate('members.invitedBy', 'name email')
      .select('-__v');
  },

  async find(filter, options = {}) {
    const query = Team.find(filter)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email')
      .populate('members.invitedBy', 'name email')
      .select('-__v')
      .sort({ createdAt: -1 });

    if (options.skip) {
      query.skip(options.skip);
    }
    if (options.limit) {
      query.limit(options.limit);
    }

    return query.exec();
  },

  async count(filter) {
    return Team.countDocuments(filter);
  },

  async update(id, data) {
    return Team.findByIdAndUpdate(id, data, { new: true })
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email')
      .populate('members.invitedBy', 'name email')
      .select('-__v');
  },

  async delete(id) {
    return Team.findByIdAndDelete(id);
  },

  async addMember(teamId, memberData) {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }
    
    // Check if user is already a member
    const existingMember = team.members.find(
      m => m.user.toString() === memberData.user.toString()
    );
    
    if (existingMember) {
      throw new Error('User is already a member of this team');
    }
    
    team.members.push(memberData);
    return team.save();
  },

  async updateMemberStatus(teamId, userId, status) {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }
    
    const member = team.members.find(
      m => m.user.toString() === userId.toString()
    );
    
    if (!member) {
      throw new Error('Member not found in team');
    }
    
    member.status = status;
    if (status === 'approved') {
      member.joinedAt = new Date();
    }
    
    return team.save();
  },

  async removeMember(teamId, userId) {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }
    
    team.members = team.members.filter(
      m => m.user.toString() !== userId.toString()
    );
    
    return team.save();
  },
};
