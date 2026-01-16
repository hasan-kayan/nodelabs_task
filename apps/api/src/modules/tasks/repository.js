import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'done', 'blocked'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  tags: [String],
  dueDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const Task = mongoose.model('Task', taskSchema);

export const taskRepository = {
  async create(data) {
    return Task.create(data);
  },

  async findById(id) {
    return Task.findById(id)
      .populate('projectId', 'name')
      .populate('teamId', 'name')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .select('-__v');
  },

  async find(filter, options = {}) {
    const query = Task.find(filter)
      .populate('projectId', 'name')
      .populate('teamId', 'name')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
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
    return Task.countDocuments(filter);
  },

  async update(id, data) {
    return Task.findByIdAndUpdate(id, data, { new: true })
      .populate('projectId', 'name')
      .populate('teamId', 'name')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .select('-__v');
  },

  async delete(id) {
    return Task.findByIdAndDelete(id);
  },
};
