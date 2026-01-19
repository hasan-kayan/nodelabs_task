import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '../../../api/projects.api.js';
import { Modal } from '../../../components/ui/modal.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Input } from '../../../components/ui/input.jsx';
import { useUIStore } from '../../../store/ui.store.js';

export function CreateProjectModal({ teamId, open, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();
  const addNotification = useUIStore((state) => state.addNotification);

  const createMutation = useMutation({
    mutationFn: (data) => projectsAPI.create({ ...data, teamId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects', { teamId }]);
      queryClient.invalidateQueries(['team', teamId]);
      addNotification({
        id: Date.now().toString(),
        message: 'Project created successfully!',
        type: 'success',
      });
      setName('');
      setDescription('');
      onClose();
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        return;
      }
      const errorMessage = error.response?.data?.error || 'Failed to create project';
      addNotification({
        id: Date.now().toString(),
        message: errorMessage,
        type: 'error',
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }
    createMutation.mutate({ name: name.trim(), description: description.trim() });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Create Project</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Project Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
            />
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !name.trim()}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
