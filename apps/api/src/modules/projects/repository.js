import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  status: {
    type: String,
    enum: ['active', 'archived', 'completed'],
    default: 'active',
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const Project = mongoose.model('Project', projectSchema);

export const projectRepository = {
  async create(data) {
    try {
      console.log('📦 ProjectRepository.create - Data:', data);
      const project = await Project.create(data);
      console.log('✅ ProjectRepository.create - Success:', project._id);
      return project;
    } catch (error) {
      console.error('❌ ProjectRepository.create - Error:', error);
      throw error;
    }
  },

  async findById(id) {
    return Project.findById(id)
      .populate('createdBy', 'name email')
      .populate('teamId', 'name')
      .populate('members', 'name email')
      .select('-__v');
  },

  async find(filter, options = {}) {
    const query = Project.find(filter)
      .populate('createdBy', 'name email')
      .populate('teamId', 'name')
      .populate('members', 'name email')
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
    return Project.countDocuments(filter);
  },

  async update(id, data) {
    return Project.findByIdAndUpdate(id, data, { new: true })
      .populate('createdBy', 'name email')
      .populate('teamId', 'name')
      .populate('members', 'name email')
      .select('-__v');
  },

  async delete(id) {
    return Project.findByIdAndDelete(id);
  },
};
