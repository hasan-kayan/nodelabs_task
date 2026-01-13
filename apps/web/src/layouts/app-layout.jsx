import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/use-auth.js';
import { Button } from '../components/ui/button.jsx';
import { ToastContainer } from '../components/ui/toast.jsx';

export default function AppLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">TaskBoard</h1>
          <div className="flex items-center gap-4">
            <span>{user?.email}</span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}
