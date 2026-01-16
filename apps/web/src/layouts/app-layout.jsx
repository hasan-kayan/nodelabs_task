import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../hooks/use-auth.js';
import { Button } from '../components/ui/button.jsx';
import { ToastContainer } from '../components/ui/toast.jsx';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">TaskBoard</h1>
            <nav className="flex gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/teams')}
                className={location.pathname.startsWith('/teams') ? 'bg-muted' : ''}
              >
                Teams
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/projects')}
                className={location.pathname.startsWith('/projects') ? 'bg-muted' : ''}
              >
                Projects
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/profile')}
                className={location.pathname.startsWith('/profile') ? 'bg-muted' : ''}
              >
                Profile
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
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
