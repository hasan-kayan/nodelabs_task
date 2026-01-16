import client from './client.js';

export const teamsAPI = {
  getAll: (params) => client.get('/api/teams', { params }),
  getById: (id) => client.get(`/api/teams/${id}`),
  create: (data) => client.post('/api/teams', data),
  update: (id, data) => client.put(`/api/teams/${id}`, data),
  delete: (id) => client.delete(`/api/teams/${id}`),
  inviteMember: (id, data) => client.post(`/api/teams/${id}/invite`, data),
  approveMember: (id, data) => client.post(`/api/teams/${id}/approve`, data),
  rejectMember: (id, data) => client.post(`/api/teams/${id}/reject`, data),
};
