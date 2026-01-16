import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../../../api/projects.api.js';
import { teamsAPI } from '../../../api/teams.api.js';
import { PageHeader } from '../../../components/common/page-header.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { EmptyState } from '../../../components/common/empty-state.jsx';
import ProjectTable from '../components/ProjectTable.jsx';
import ProjectFilters from '../components/ProjectFilters.jsx';
import { EditProjectModal } from '../components/EditProjectModal.jsx';
import { useAuthStore } from '../../../hooks/use-auth.js';
import { useRole } from '../../../hooks/use-role.js';
import { useUIStore } from '../../../store/ui.store.js';

export default function ProjectsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { isAdmin } = useRole();
  const addNotification = useUIStore((state) => state.addNotification);
  const [filters, setFilters] = useState({ search: '', status: '', teamId: '' });
  const [editingProject, setEditingProject] = useState(null);
  
  // Fetch user's teams for filter
  const { data: teamsData } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsAPI.getAll(),
    enabled: true,
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id) => projectsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      addNotification({
        id: Date.now().toString(),
        message: 'Project deleted successfully!',
        type: 'success',
      });
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        return;
      }
      const errorMessage = error.response?.data?.error || 'Failed to delete project';
      addNotification({
        id: Date.now().toString(),
        message: errorMessage,
        type: 'error',
      });
    },
  });

  const handleDelete = (project) => {
    deleteMutation.mutate(project._id);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      console.log('📋 Fetching projects...');
      try {
        const response = await projectsAPI.getAll(filters);
        console.log('✅ Projects response:', response.data);
        return response;
      } catch (err) {
        console.error('❌ Projects API error:', err);
        // If 401, don't retry - let interceptor handle it
        if (err.response?.status === 401) {
          throw err;
        }
        throw err;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
  });

  // Handle 401 errors - show loading while redirect happens
  if (error?.response?.status === 401) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Session expired. Redirecting to login...</div>
      </div>
    );
  }
  
  // Show error UI for other errors
  if (error) {
    console.error('Projects API error:', error);
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">
          Error loading projects: {error.response?.data?.error || error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Projects"
        description="Manage your projects and tasks"
      >
        <Button onClick={() => navigate('/projects/new')}>New Project</Button>
      </PageHeader>

      <ProjectFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        teams={teamsData?.data?.teams || []}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div>Loading projects...</div>
        </div>
      ) : !data?.data?.projects || data?.data?.projects?.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Create your first project to get started"
          action={
            <Button onClick={() => navigate('/projects/new')}>
              Create Your First Project
            </Button>
          }
        />
      ) : (
        <>
          <ProjectTable
            projects={data?.data?.projects || []}
            onRowClick={(project) => navigate(`/projects/${project._id}`)}
            onEdit={(project) => setEditingProject(project)}
            onDelete={handleDelete}
            canEdit={(project) => {
              const projectCreatorId = project.createdBy?._id?.toString() || project.createdBy?.toString();
              const currentUserId = user?.id?.toString();
              return isAdmin || projectCreatorId === currentUserId;
            }}
            canDelete={(project) => {
              const projectCreatorId = project.createdBy?._id?.toString() || project.createdBy?.toString();
              const currentUserId = user?.id?.toString();
              return isAdmin || projectCreatorId === currentUserId;
            }}
          />
          
          {editingProject && (
            <EditProjectModal
              project={editingProject}
              open={!!editingProject}
              onClose={() => setEditingProject(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
