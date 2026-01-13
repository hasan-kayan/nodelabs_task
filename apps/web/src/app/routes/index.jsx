import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './protected.jsx';
import { useAuthStore } from '../../hooks/use-auth.js';
import LoginPage from '../../features/auth/pages/Login.jsx';
import ProjectsListPage from '../../features/projects/pages/ProjectsList.jsx';
import ProjectDetailPage from '../../features/projects/pages/ProjectDetail.jsx';
import TaskDetailPage from '../../features/tasks/pages/TaskDetail.jsx';
import ProfilePage from '../../features/profile/pages/Profile.jsx';
import AppLayout from '../../layouts/app-layout.jsx';
import AuthLayout from '../../layouts/auth-layout.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/projects" element={<ProjectsListPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/" element={<Navigate to="/projects" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
