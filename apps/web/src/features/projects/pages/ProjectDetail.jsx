import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { projectsAPI } from '../../../api/projects.api.js';
import { tasksAPI } from '../../../api/tasks.api.js';
import { PageHeader } from '../../../components/common/page-header.jsx';
import TaskTable from '../../tasks/components/TaskTable.jsx';
import { useSocketEvent } from '../../../hooks/use-socket.js';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  
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

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title={project?.data?.name}
        description={project?.data?.description}
      />

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Tasks</h2>
        {tasksLoading ? (
          <div>Loading tasks...</div>
        ) : (
          <TaskTable tasks={tasks?.data?.tasks || []} />
        )}
      </div>
    </div>
  );
}
