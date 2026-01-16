import axios from 'axios';
import { useAuthStore } from '../hooks/use-auth.js';
import config from '../config/env.js';

const client = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
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
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const { refreshToken, logout } = useAuthStore.getState();
      
      // If no refresh token, logout immediately
      if (!refreshToken) {
        console.log('❌ No refresh token, logging out...');
        logout();
        // Clear any pending requests
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
      
      try {
        console.log('🔄 Attempting to refresh token...');
        const response = await axios.post(`${config.apiUrl}/api/auth/refresh`, {
          refreshToken,
        });
        
        if (response.data?.accessToken) {
          console.log('✅ Token refreshed successfully');
          useAuthStore.getState().updateToken(response.data.accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return client.request(originalRequest);
        } else {
          throw new Error('Invalid refresh response');
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        // Refresh token is invalid or expired, logout and redirect
        logout();
        
        // Only redirect if we're not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
    }
    
    // For other errors, just reject
    return Promise.reject(error);
  }
);

export default client;
