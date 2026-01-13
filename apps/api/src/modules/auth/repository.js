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
