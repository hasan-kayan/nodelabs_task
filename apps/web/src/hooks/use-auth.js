import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      
      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        console.log('🚪 Logging out...');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        // Clear localStorage manually to ensure it's cleared
        try {
          localStorage.removeItem('auth-storage');
        } catch (error) {
          console.error('Error clearing auth storage:', error);
        }
      },
      
      updateToken: (accessToken) => {
        set({ accessToken });
      },
      
      // Check if token is expired
      isTokenExpired: () => {
        const { accessToken } = get();
        if (!accessToken) return true;
        
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const exp = payload.exp * 1000;
          return Date.now() >= exp;
        } catch (error) {
          return true;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
