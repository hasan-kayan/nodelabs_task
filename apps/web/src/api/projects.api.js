import client from './client.js';

export const projectsAPI = {
  getAll: (params) => client.get('/api/projects', { params }),
  getById: (id) => client.get(`/api/projects/${id}`),
  create: (data) => client.post('/api/projects', data),
  update: (id, data) => client.put(`/api/projects/${id}`, data),
  delete: (id) => client.delete(`/api/projects/${id}`),
};
