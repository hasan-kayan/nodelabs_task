import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../../../api/tasks.api.js';
import { projectsAPI } from '../../../api/projects.api.js';
import { teamsAPI } from '../../../api/teams.api.js';
import { Modal } from '../../../components/ui/modal.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Input } from '../../../components/ui/input.jsx';
import { DatePicker } from '../../../components/ui/date-picker.jsx';
import { useUIStore } from '../../../store/ui.store.js';
import { useAuthStore } from '../../../hooks/use-auth.js';

export function CreateTaskModal({ projectId: initialProjectId, open, onClose }) {
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const queryClient = useQueryClient();
  const addNotification = useUIStore((state) => state.addNotification);
  const { user } = useAuthStore();

  // Fetch user's projects if no initial projectId
  const { data: projectsData } = useQuery({
    queryKey: ['projects', 'user'],
    queryFn: () => projectsAPI.getAll({ limit: 100 }),
    enabled: open && !initialProjectId,
  });

  const availableProjects = projectsData?.data?.projects || [];

  // Fetch selected project to get teamId
  const { data: projectData } = useQuery({
    queryKey: ['project', selectedProjectId],
    queryFn: () => projectsAPI.getById(selectedProjectId),
    enabled: open && !!selectedProjectId,
  });

  const project = projectData?.data;
  const teamId = project?.teamId?._id || project?.teamId;

  // Fetch team to get members
  const { data: teamData } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamsAPI.getById(teamId),
    enabled: open && !!teamId,
  });

  // Get approved team members
  const teamMembers = (teamData?.data?.members || [])
    .filter(m => m.status === 'approved')
    .map(m => ({
      _id: m.user?._id || m.user,
      name: m.user?.name,
      email: m.user?.email,
    }));

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setSelectedProjectId(initialProjectId || '');
      setTitle('');
      setDescription('');
      setPriority('medium');
      setAssignedTo('');
      setDueDate(null);
    }
  }, [open, initialProjectId]);

  const createTaskMutation = useMutation({
    mutationFn: (data) => tasksAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['project', selectedProjectId]);
      queryClient.invalidateQueries(['projects']);
      addNotification({
        id: Date.now().toString(),
        message: 'Task created successfully!',
        type: 'success',
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setAssignedTo('');
      setDueDate(null);
      if (!initialProjectId) {
        setSelectedProjectId('');
      }
      onClose();
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        return;
      }
      const errorMessage = error.response?.data?.error || 'Failed to create task';
      addNotification({
        id: Date.now().toString(),
        message: errorMessage,
        type: 'error',
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedProjectId) {
      return;
    }
    createTaskMutation.mutate({
      projectId: selectedProjectId,
      title: title.trim(),
      description: description.trim(),
      priority,
      status: 'todo',
      ...(assignedTo && { assignedTo }),
      ...(dueDate && { dueDate: typeof dueDate === 'string' ? dueDate : new Date(dueDate).toISOString() }),
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Create Task</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!initialProjectId && (
            <div>
              <label className="block text-sm font-medium mb-2">Project *</label>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setAssignedTo(''); // Reset assigned user when project changes
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select a project</option>
                {availableProjects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name} {project.teamId?.name ? `(${project.teamId.name})` : ''}
                  </option>
                ))}
              </select>
              {selectedProjectId && project && (
                <p className="text-xs text-muted-foreground mt-1">
                  Team: {project.teamId?.name || 'No team'}
                </p>
              )}
            </div>
          )}

          {selectedProjectId && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">Project: {project?.name}</p>
              {project?.teamId?.name && (
                <p className="text-xs text-muted-foreground">Team: {project.teamId.name}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Task Title *</label>
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

          {selectedProjectId && teamMembers.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Assign To {project?.teamId?.name ? `(Team: ${project.teamId.name})` : ''}
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name || member.email}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {teamMembers.length} team member(s) available
              </p>
            </div>
          )}

          {selectedProjectId && teamMembers.length === 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                No team members available. Task will be created unassigned.
              </p>
            </div>
          )}

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
              disabled={createTaskMutation.isPending || !title.trim() || !selectedProjectId}
            >
              {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
