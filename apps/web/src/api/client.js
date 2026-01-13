import axios from 'axios';
import { useAuthStore } from '../hooks/use-auth.js';
import config from '../config/env.js';

const client = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
client.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    console.log('🔑 Request with token:', config.url);
  } else {
    console.warn('⚠️ Request without token:', config.url);
  }
  return config;
});

// Response interceptor
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { refreshToken, logout } = useAuthStore.getState();
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${config.apiUrl}/api/auth/refresh`, {
            refreshToken,
          });
          
          useAuthStore.getState().updateToken(response.data.accessToken);
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return client.request(error.config);
        } catch (refreshError) {
          logout();
          window.location.href = '/login';
        }
      } else {
        logout();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default client;
