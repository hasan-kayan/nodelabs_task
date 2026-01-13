import client from './client.js';

export const tasksAPI = {
  getAll: (params) => client.get('/api/tasks', { params }),
  getById: (id) => client.get(`/api/tasks/${id}`),
  create: (data) => client.post('/api/tasks', data),
  update: (id, data) => client.put(`/api/tasks/${id}`, data),
  delete: (id) => client.delete(`/api/tasks/${id}`),
};
