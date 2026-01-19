import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { tasksAPI } from '../../../api/tasks.api.js';
import { PageHeader } from '../../../components/common/page-header.jsx';
import CommentList from '../components/CommentList.jsx';
import { useSocketEvent } from '../../../hooks/use-socket.js';
import { useRole } from '../../../hooks/use-role.js';
import { Button } from '../../../components/ui/button.jsx';
import { DatePicker } from '../../../components/ui/date-picker.jsx';
import { Dropdown } from '../../../components/ui/dropdown.jsx';
import { Calendar, Clock, User, Tag, CheckCircle2, Circle, AlertCircle, XCircle } from 'lucide-react';

export default function TaskDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { isAdmin } = useRole();
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [deadlineValue, setDeadlineValue] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksAPI.getById(id),
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data) => tasksAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['task', id]);
      setIsEditingDeadline(false);
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

  // Listen for real-time updates
  useSocketEvent('task.updated', () => {
    queryClient.invalidateQueries(['task', id]);
  });

  useSocketEvent('comment.added', () => {
    queryClient.invalidateQueries(['task', id]);
  });

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  const task = data?.data;
  if (!task) return <div className="flex items-center justify-center min-h-screen">Task not found</div>;

  const statusOptions = [
    { value: 'todo', label: 'To Do', icon: Circle, color: 'text-gray-500' },
    { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-blue-500' },
    { value: 'done', label: 'Done', icon: CheckCircle2, color: 'text-green-500' },
    { value: 'blocked', label: 'Blocked', icon: XCircle, color: 'text-red-500' },
  ];

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  const handleStatusChange = (newStatus) => {
    updateTaskMutation.mutate({ status: newStatus });
  };

  const handleDeadlineSave = () => {
    if (deadlineValue) {
      const dateValue = typeof deadlineValue === 'string' ? deadlineValue : new Date(deadlineValue).toISOString();
      updateTaskMutation.mutate({ dueDate: dateValue });
    } else {
      updateTaskMutation.mutate({ dueDate: null });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  const currentStatus = statusOptions.find(s => s.value === task.status) || statusOptions[0];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <PageHeader title={task?.title} description={task?.description} />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Status
              </h3>
              {isAdmin && (
                <Dropdown
                  trigger={
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  }
                >
                  {statusOptions.map((option) => {
                    const OptionIcon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleStatusChange(option.value)}
                        className="w-full text-left px-4 py-2 hover:bg-accent flex items-center gap-2"
                      >
                        <OptionIcon className={`h-4 w-4 ${option.color}`} />
                        {option.label}
                      </button>
                    );
                  })}
                </Dropdown>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${currentStatus.color}`} />
              <span className="capitalize">{currentStatus.label}</span>
            </div>
          </div>

          {/* Priority */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Priority
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${priorityColors[task.priority] || priorityColors.medium}`}>
              {task.priority}
            </span>
          </div>

          {/* Assigned To */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Assigned To
            </h3>
            <p className="text-muted-foreground">
              {task.assignedTo?.name || task.assignedTo?.email || 'Unassigned'}
            </p>
          </div>

          {/* Project */}
          {task.projectId && (
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Project</h3>
              <p className="text-muted-foreground">{task.projectId.name}</p>
            </div>
          )}

          {/* Team */}
          {task.teamId && (
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Team</h3>
              <p className="text-muted-foreground">{task.teamId.name}</p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Deadline */}
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Deadline
              </h3>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditingDeadline(!isEditingDeadline);
                    if (task.dueDate) {
                      setDeadlineValue(task.dueDate);
                    } else {
                      setDeadlineValue(null);
                    }
                  }}
                >
                  {isEditingDeadline ? 'Cancel' : 'Edit'}
                </Button>
              )}
            </div>
            {isEditingDeadline ? (
              <div className="space-y-2">
                <DatePicker
                  value={deadlineValue}
                  onChange={(value) => setDeadlineValue(value)}
                  placeholder="Select deadline date and time"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleDeadlineSave}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditingDeadline(false);
                      setDeadlineValue(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className={isOverdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'}>
                  {formatDate(task.dueDate)}
                  {isOverdue && ' (Overdue)'}
                </p>
              </div>
            )}
          </div>

          {/* Created Info */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Created</h3>
            <p className="text-sm text-muted-foreground">
              {task.createdBy?.name || task.createdBy?.email} • {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-secondary rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-6 bg-card border rounded-lg p-6">
        <h3 className="font-semibold mb-4 text-lg">Comments</h3>
        <CommentList taskId={id} />
      </div>
    </div>
  );
}
