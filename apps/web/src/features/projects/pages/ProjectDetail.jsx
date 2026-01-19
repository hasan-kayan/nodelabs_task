import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI } from '../../../api/projects.api.js';
import { tasksAPI } from '../../../api/tasks.api.js';
import { PageHeader } from '../../../components/common/page-header.jsx';
import { Button } from '../../../components/ui/button.jsx';
import TaskTable from '../../tasks/components/TaskTable.jsx';
import { EditProjectModal } from '../components/EditProjectModal.jsx';
import { useSocketEvent } from '../../../hooks/use-socket.js';
import { useAuthStore } from '../../../hooks/use-auth.js';
import { useRole } from '../../../hooks/use-role.js';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { isAdmin } = useRole();
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  const { data: project, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsAPI.getById(id),
  });

  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['tasks', { projectId: id }],
    queryFn: () => tasksAPI.getAll({ projectId: id }),
  });

  // Handle 401 errors - show loading while redirect happens
  if (projectError?.response?.status === 401 || tasksError?.response?.status === 401) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Session expired. Redirecting to login...</div>
      </div>
    );
  }

  // Listen for real-time updates
  useSocketEvent('task.updated', () => {
    // Refetch tasks on update
    queryClient.invalidateQueries(['tasks', { projectId: id }]);
  });

  if (projectLoading) return <div>Loading...</div>;

  const projectData = project?.data;
  
  // Check if user can edit (admin or project creator)
  // createdBy can be populated object or just ID string
  const projectCreatorId = projectData?.createdBy?._id?.toString() || 
                           projectData?.createdBy?.toString();
  const currentUserId = user?.id?.toString();
  const canEdit = isAdmin || projectCreatorId === currentUserId;

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title={projectData?.name}
        description={projectData?.description}
      >
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditModalOpen(true)}>
              Edit Project
            </Button>
          </div>
        )}
      </PageHeader>

      <div className="mt-6 space-y-6">
        {projectData?.teamId && (
          <div>
            <h3 className="font-semibold mb-2">Team</h3>
            <p>{projectData.teamId?.name || 'N/A'}</p>
          </div>
        )}
        
        <div>
          <h3 className="font-semibold mb-2">Status</h3>
          <p className="capitalize">{projectData?.status || 'active'}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          {tasksLoading ? (
            <div>Loading tasks...</div>
          ) : (
            <TaskTable 
              tasks={tasks?.data?.tasks || []} 
              onRowClick={(task) => navigate(`/tasks/${task._id}`)}
            />
          )}
        </div>
      </div>

      {projectData && (
        <EditProjectModal
          project={projectData}
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
        />
      )}
    </div>
  );
}
