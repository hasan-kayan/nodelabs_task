import client from './client.js';

export const commentsAPI = {
  getByTask: (taskId) => client.get(`/api/comments/task/${taskId}`),
  create: (data) => client.post('/api/comments', data),
  update: (id, data) => client.put(`/api/comments/${id}`, data),
  delete: (id) => client.delete(`/api/comments/${id}`),
};
