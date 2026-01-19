import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { tasksAPI } from '../../../api/tasks.api.js';
import { PageHeader } from '../../../components/common/page-header.jsx';
import TaskTable from '../components/TaskTable.jsx';
import { useRole } from '../../../hooks/use-role.js';
import { Input } from '../../../components/ui/input.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Dropdown } from '../../../components/ui/dropdown.jsx';

export default function TasksListPage() {
  const navigate = useNavigate();
  const { isAdmin } = useRole();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', { page, search, status: statusFilter, admin: isAdmin }],
    queryFn: () => tasksAPI.getAll({ 
      page, 
      limit,
      ...(search && { search }),
      ...(statusFilter && { status: statusFilter }),
    }),
  });

  // Handle 401 errors
  if (error?.response?.status === 401) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Session expired. Redirecting to login...</div>
      </div>
    );
  }

  const tasks = data?.data?.tasks || [];
  const pagination = data?.data?.pagination || { page: 1, pages: 1, total: 0 };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'blocked', label: 'Blocked' },
  ];

  return (
    <div className="container mx-auto p-6">
      <PageHeader 
        title={isAdmin ? "All Tasks" : "My Tasks"}
        description={isAdmin ? "View and manage all tasks across all teams" : "View your assigned tasks"}
      />

      <div className="mt-6 space-y-4">
        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Dropdown
            trigger={
              <Button variant="outline">
                {statusOptions.find(s => s.value === statusFilter)?.label || 'All Statuses'}
              </Button>
            }
          >
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setStatusFilter(option.value);
                  setPage(1);
                }}
                className="w-full text-left px-4 py-2 hover:bg-accent"
              >
                {option.label}
              </button>
            ))}
          </Dropdown>
        </div>

        {/* Tasks Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            No tasks found
          </div>
        ) : (
          <>
            <TaskTable 
              tasks={tasks} 
              onRowClick={(task) => navigate(`/tasks/${task._id}`)}
            />
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} tasks
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
