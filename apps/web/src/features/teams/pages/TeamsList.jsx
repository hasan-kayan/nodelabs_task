import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { teamsAPI } from '../../../api/teams.api.js';
import { PageHeader } from '../../../components/common/page-header.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { EmptyState } from '../../../components/common/empty-state.jsx';
import { useUIStore } from '../../../store/ui.store.js';
import { useRole } from '../../../hooks/use-role.js';
import { DataTable } from '../../../components/common/data-table.jsx';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

export default function TeamsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useRole();
  const addNotification = useUIStore((state) => state.addNotification);

  const { data, isLoading, error } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsAPI.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => teamsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['teams']);
      addNotification({
        id: Date.now().toString(),
        message: 'Team deleted successfully!',
        type: 'success',
      });
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        return;
      }
      const errorMessage = error.response?.data?.error || 'Failed to delete team';
      addNotification({
        id: Date.now().toString(),
        message: errorMessage,
        type: 'error',
      });
    },
  });

  const handleDelete = (team) => {
    if (confirm(`Are you sure you want to delete team "${team.name}"?`)) {
      deleteMutation.mutate(team._id);
    }
  };

  const columns = [
    columnHelper.accessor('name', {
      header: 'Team Name',
    }),
    columnHelper.accessor('members', {
      header: 'Members',
      cell: (info) => {
        const members = info.getValue() || [];
        const approved = members.filter(m => m.status === 'approved').length;
        return `${approved} / ${members.length}`;
      },
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const team = info.row.original;
        const canDelete = isAdmin || team.createdBy?._id === team.createdBy?._id;
        
        return (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/teams/${team._id}`);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View
            </button>
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(team);
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            )}
          </div>
        );
      },
    }),
  ];

  if (error?.response?.status === 401) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Session expired. Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Teams"
        description="Manage your teams and collaborate"
      >
        <Button onClick={() => navigate('/teams/new')}>New Team</Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div>Loading teams...</div>
        </div>
      ) : !data?.data?.teams || data?.data?.teams?.length === 0 ? (
        <EmptyState
          title="No teams found"
          description="Create your first team to get started"
          action={
            <Button onClick={() => navigate('/teams/new')}>
              Create Your First Team
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data?.teams || []}
          onRowClick={(team) => navigate(`/teams/${team._id}`)}
        />
      )}
    </div>
  );
}
