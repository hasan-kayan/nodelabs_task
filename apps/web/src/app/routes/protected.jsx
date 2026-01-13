import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../hooks/use-auth.js';
import { useEffect, useState } from 'react';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, accessToken, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Small delay to ensure auth state is loaded from localStorage
    const timer = setTimeout(() => {
      setIsChecking(false);
      console.log('🔒 Auth check:', { isAuthenticated, hasToken: !!accessToken, user });
    }, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, accessToken, user]);

  if (isChecking) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !accessToken) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return children || <Outlet />;
}
