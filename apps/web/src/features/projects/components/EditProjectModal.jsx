import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { projectsAPI } from '../../../api/projects.api.js';
import { teamsAPI } from '../../../api/teams.api.js';
import { Modal } from '../../../components/ui/modal.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Input } from '../../../components/ui/input.jsx';
import { useUIStore } from '../../../store/ui.store.js';
import { useRole } from '../../../hooks/use-role.js';

export function EditProjectModal({ project, open, onClose }) {
  const queryClient = useQueryClient();
  const addNotification = useUIStore((state) => state.addNotification);
  const { isAdmin } = useRole();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    teamId: '',
  });
  const [errors, setErrors] = useState({});
  
  // Fetch user's teams
  const { data: teamsData } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsAPI.getAll(),
  });

  // Initialize form when project data is available
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'active',
        teamId: project.teamId?._id || project.teamId || '',
      });
      setErrors({});
    }
  }, [project]);

  const updateMutation = useMutation({
    mutationKey: ['updateProject', project?._id],
    mutationFn: async (data) => {
      const response = await projectsAPI.update(project._id, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project', project._id]);
      queryClient.invalidateQueries(['projects']);
      addNotification({
        id: Date.now().toString(),
        message: 'Project updated successfully!',
        type: 'success',
      });
      onClose();
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        return;
      }
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Failed to update project';
      addNotification({
        id: Date.now().toString(),
        message: errorMessage,
        type: 'error',
      });
      setErrors({ submit: errorMessage });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.name.trim()) {
      setErrors({ name: 'Project name is required' });
      return;
    }

    const updateData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      status: formData.status,
    };
    
    // Add teamId if selected
    if (formData.teamId) {
      updateData.teamId = formData.teamId;
    }
    
    updateMutation.mutate(updateData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // This component should only be rendered if user has permission
  // Permission check is done in parent component

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Edit Project</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter project name"
              required
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter project description"
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Team (Optional)</label>
            <select
              value={formData.teamId}
              onChange={(e) => handleChange('teamId', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">No Team</option>
              {teamsData?.data?.teams?.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending || !formData.name.trim()}
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Project'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
