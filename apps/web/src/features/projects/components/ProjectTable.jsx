import { useMemo } from 'react';
import { DataTable } from '../../../components/common/data-table.jsx';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

export default function ProjectTable({ projects, onRowClick, onEdit, onDelete, canEdit, canDelete }) {
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
      }),
      columnHelper.accessor('teamId', {
        header: 'Team',
        cell: (info) => {
          const team = info.getValue();
          return team?.name || 'No Team';
        },
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => (
          <span className="capitalize">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      ...(onEdit || onDelete ? [
        columnHelper.display({
          id: 'actions',
          header: 'Actions',
          cell: (info) => {
            const project = info.row.original;
            const projectCanEdit = canEdit?.(project) ?? true;
            const projectCanDelete = canDelete?.(project) ?? true;
            
            return (
              <div className="flex gap-2">
                {onEdit && projectCanEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(project);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                )}
                {onDelete && projectCanDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this project?')) {
                        onDelete(project);
                      }
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
      ] : []),
    ],
    [onEdit, onDelete, canEdit, canDelete]
  );

  return <DataTable columns={columns} data={projects} onRowClick={onRowClick} />;
}
