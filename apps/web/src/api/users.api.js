import client from './client.js';

export const userAPI = {
  getProfile: () => client.get('/api/users/profile'),
  updateProfile: (data) => client.put('/api/users/profile', data),
  getSessions: () => client.get('/api/users/sessions'),
};
