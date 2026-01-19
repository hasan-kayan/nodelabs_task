import { User } from '../users/repository.js';

export const authRepository = {
  async findByEmailOrPhone(email, phone) {
    return User.findOne({
      $or: [
        { email },
        { phone },
      ],
    });
  },

  async findByEmailAndPhone(email, phone) {
    // Find user where both email and phone match exactly
    // Both must be provided and both must match
    if (email && phone) {
      return User.findOne({
        email,
        phone,
      });
    }
    
    // If only one is provided, return null (should not happen in login with both)
    return null;
  },

  async findById(id) {
    return User.findById(id);
  },

  async create(data) {
    return User.create(data);
  },

  async update(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true }).select('-__v');
  },
};
