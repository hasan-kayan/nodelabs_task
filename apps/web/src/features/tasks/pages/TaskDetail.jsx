import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { tasksAPI } from '../../../api/tasks.api.js';
import { PageHeader } from '../../../components/common/page-header.jsx';
import CommentList from '../components/CommentList.jsx';
import { useSocketEvent } from '../../../hooks/use-socket.js';

export default function TaskDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksAPI.getById(id),
  });

  // Handle 401 errors - show loading while redirect happens
  if (error?.response?.status === 401) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Session expired. Redirecting to login...</div>
      </div>
    );
  }

  // Listen for real-time comment updates
  useSocketEvent('comment.added', () => {
    queryClient.invalidateQueries(['task', id]);
  });

  if (isLoading) return <div>Loading...</div>;

  const task = data?.data;

  return (
    <div className="container mx-auto p-6">
      <PageHeader title={task?.title} description={task?.description} />

      <div className="mt-6 space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Status</h3>
          <p>{task?.status}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Priority</h3>
          <p>{task?.priority}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Comments</h3>
          <CommentList taskId={id} />
        </div>
      </div>
    </div>
  );
}
