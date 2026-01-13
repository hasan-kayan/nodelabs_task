import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../../../api/projects.api.js';
import { PageHeader } from '../../../components/common/page-header.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { EmptyState } from '../../../components/common/empty-state.jsx';
import ProjectTable from '../components/ProjectTable.jsx';
import ProjectFilters from '../components/ProjectFilters.jsx';

export default function ProjectsListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: '', status: '' });

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
        throw err;
      }
    },
    retry: 1,
  });

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

      <ProjectFilters filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div>Loading projects...</div>
        </div>
      ) : error ? (
        <div className="container mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold mb-2">Error loading projects</h3>
            <p className="text-red-600 text-sm">
              {error.response?.data?.error || error.message || 'Unknown error'}
            </p>
            {error.response?.status === 401 && (
              <p className="text-red-600 text-sm mt-2">
                Please check if you are logged in correctly.
              </p>
            )}
          </div>
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
        <ProjectTable
          projects={data?.data?.projects || []}
          onRowClick={(project) => navigate(`/projects/${project._id}`)}
        />
      )}
    </div>
  );
}
