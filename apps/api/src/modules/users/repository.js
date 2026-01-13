import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member',
  },
  name: String,
  avatar: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const User = mongoose.model('User', userSchema);

export const userRepository = {
  async findById(id) {
    return User.findById(id).select('-__v');
  },

  async findByEmail(email) {
    return User.findOne({ email });
  },

  async findByPhone(phone) {
    return User.findOne({ phone });
  },

  async create(data) {
    return User.create(data);
  },

  async update(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true }).select('-__v');
  },

  async delete(id) {
    return User.findByIdAndDelete(id);
  },
};
