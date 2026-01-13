import client from './client.js';

export const authAPI = {
  requestOTP: (data) => client.post('/api/auth/otp/request', data),
  verifyOTP: (data) => client.post('/api/auth/otp/verify', data),
  refreshToken: (refreshToken) => client.post('/api/auth/refresh', { refreshToken }),
  logout: () => client.post('/api/auth/logout'),
  register: (data) => client.post('/api/auth/register', data),
};
