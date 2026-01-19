import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '../../../api/projects.api.js';
import { tasksAPI } from '../../../api/tasks.api.js';
import { Modal } from '../../../components/ui/modal.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Input } from '../../../components/ui/input.jsx';
import { DatePicker } from '../../../components/ui/date-picker.jsx';
import { useUIStore } from '../../../store/ui.store.js';

export function AssignTaskModal({ teamId, userId, userName, open, onClose }) {
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(null);
  const queryClient = useQueryClient();
  const addNotification = useUIStore((state) => state.addNotification);

  // Fetch team projects
  const { data: projectsData } = useQuery({
    queryKey: ['projects', { teamId }],
    queryFn: () => projectsAPI.getAll({ teamId, limit: 100 }),
    enabled: open && !!teamId,
  });

  const projects = projectsData?.data?.projects || [];

  const createTaskMutation = useMutation({
    mutationFn: (data) => tasksAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['projects', { teamId }]);
      addNotification({
        id: Date.now().toString(),
        message: 'Task assigned successfully!',
        type: 'success',
      });
      setProjectId('');
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate(null);
      onClose();
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        return;
      }
      const errorMessage = error.response?.data?.error || 'Failed to assign task';
      addNotification({
        id: Date.now().toString(),
        message: errorMessage,
        type: 'error',
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!projectId || !title.trim()) {
      return;
    }
    createTaskMutation.mutate({
      projectId,
      title: title.trim(),
      description: description.trim(),
      assignedTo: userId,
      priority,
      status: 'todo',
      ...(dueDate && { dueDate: typeof dueDate === 'string' ? dueDate : new Date(dueDate).toISOString() }),
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Assign Task to {userName}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Task Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Deadline</label>
            <DatePicker
              value={dueDate}
              onChange={(value) => setDueDate(value)}
              placeholder="Select deadline date and time"
            />
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTaskMutation.isPending || !projectId || !title.trim()}
            >
              {createTaskMutation.isPending ? 'Assigning...' : 'Assign Task'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
