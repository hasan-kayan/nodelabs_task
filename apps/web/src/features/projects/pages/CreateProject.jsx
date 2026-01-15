import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '../../../api/projects.api.js';
import { PageHeader } from '../../../components/common/page-header.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Input } from '../../../components/ui/input.jsx';
import { useUIStore } from '../../../store/ui.store.js';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addNotification = useUIStore((state) => state.addNotification);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationKey: ['createProject'],
    mutationFn: async (data) => {
      console.log('📤 Creating project:', data);
      try {
        const response = await projectsAPI.create(data);
        console.log('✅ Project created response:', response);
        return response;
      } catch (error) {
        console.error('❌ API error:', error);
        throw error;
      }
    },
    onSuccess: (response) => {
      console.log('✅ Project created successfully:', response.data);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      addNotification({
        id: Date.now().toString(),
        message: 'Project created successfully!',
        type: 'success',
      });
      navigate('/projects');
    },
    onError: (error) => {
      console.error('❌ Create project error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      let errorMessage = 'Failed to create project';
      
      if (error.response?.data) {
        errorMessage = error.response.data.error || 
                      error.response.data.message || 
                      JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
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

    // Validation
    if (!formData.name.trim()) {
      setErrors({ name: 'Project name is required' });
      return;
    }

    // Prepare clean data (only project fields, no extra fields)
    const projectData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      status: formData.status || 'active',
    };

    console.log('📤 Submitting project:', projectData);
    createMutation.mutate(projectData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <PageHeader
        title="Create New Project"
        description="Add a new project to organize your tasks"
      />

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
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

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/projects')}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || !formData.name.trim()}
            className="flex-1"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
}
