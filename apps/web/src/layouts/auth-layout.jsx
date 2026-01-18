import { Outlet } from 'react-router-dom';
import { ThemeToggle } from '../components/ui/theme-toggle.jsx';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Outlet />
    </div>
  );
}
