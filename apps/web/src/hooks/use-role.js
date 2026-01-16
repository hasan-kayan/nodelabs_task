import { useAuthStore } from './use-auth.js';

export function useRole() {
  const { user } = useAuthStore();
  
  const isAdmin = user?.role === 'admin';
  const isMember = user?.role === 'member';
  const hasRole = (role) => user?.role === role;
  const hasAnyRole = (...roles) => roles.includes(user?.role);
  
  return {
    isAdmin,
    isMember,
    hasRole,
    hasAnyRole,
    role: user?.role,
  };
}
