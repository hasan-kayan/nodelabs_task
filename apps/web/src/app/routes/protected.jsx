import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../hooks/use-auth.js';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, accessToken, user, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Small delay to ensure auth state is loaded from localStorage
    const timer = setTimeout(() => {
      setIsChecking(false);
      console.log('🔒 Auth check:', { isAuthenticated, hasToken: !!accessToken, user });
      
      // If no token or not authenticated, clear everything
      if (!isAuthenticated || !accessToken) {
        console.log('❌ Not authenticated, clearing state...');
        logout();
        queryClient.clear(); // Clear all queries
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, accessToken, user, logout, queryClient]);

  // Check token expiration (if token exists, decode and check exp)
  useEffect(() => {
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        
        if (exp < now) {
          console.log('❌ Token expired, logging out...');
          logout();
          queryClient.clear();
        } else {
          // Set a timer to logout when token expires
          const timeUntilExpiry = exp - now;
          const timer = setTimeout(() => {
            console.log('⏰ Token expired, logging out...');
            logout();
            queryClient.clear();
            window.location.href = '/login';
          }, timeUntilExpiry);
          
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('❌ Error checking token expiration:', error);
        // If we can't decode token, it's invalid
        logout();
        queryClient.clear();
      }
    }
  }, [accessToken, logout, queryClient]);

  if (isChecking) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !accessToken) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return children || <Outlet />;
}
