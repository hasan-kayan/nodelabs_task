import mongoose from 'mongoose';
import { Task } from '../tasks/repository.js';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

commentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const Comment = mongoose.model('Comment', commentSchema);

export const commentRepository = {
  async create(data) {
    return Comment.create(data);
  },

  async findById(id) {
    return Comment.findById(id)
      .populate('userId', 'name email')
      .populate('taskId', 'title')
      .select('-__v');
  },

  async findByTask(taskId) {
    return Comment.find({ taskId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .select('-__v');
  },

  async update(id, data) {
    return Comment.findByIdAndUpdate(id, data, { new: true })
      .populate('userId', 'name email')
      .populate('taskId', 'title')
      .select('-__v');
  },

  async delete(id) {
    return Comment.findByIdAndDelete(id);
  },

  async getTaskById(taskId) {
    return Task.findById(taskId);
  },
};
