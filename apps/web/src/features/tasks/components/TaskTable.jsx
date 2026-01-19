import { useMemo } from 'react';
import { DataTable } from '../../../components/common/data-table.jsx';
import { createColumnHelper } from '@tanstack/react-table';
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';

const columnHelper = createColumnHelper();

const statusConfig = {
  todo: { label: 'To Do', icon: Circle, color: 'text-gray-500' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-blue-500' },
  done: { label: 'Done', icon: CheckCircle2, color: 'text-green-500' },
  blocked: { label: 'Blocked', icon: XCircle, color: 'text-red-500' },
};

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export default function TaskTable({ tasks, onRowClick }) {
  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => (
          <div className="font-medium">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          const config = statusConfig[status] || statusConfig.todo;
          const Icon = config.icon;
          return (
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${config.color}`} />
              <span className="capitalize">{config.label}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('priority', {
        header: 'Priority',
        cell: (info) => {
          const priority = info.getValue();
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${priorityColors[priority] || priorityColors.medium}`}>
              {priority}
            </span>
          );
        },
      }),
      columnHelper.accessor('assignedTo', {
        header: 'Assigned To',
        cell: (info) => {
          const user = info.getValue();
          return <span className="text-muted-foreground">{user?.name || user?.email || 'Unassigned'}</span>;
        },
      }),
      columnHelper.accessor('dueDate', {
        header: 'Deadline',
        cell: (info) => {
          const dueDate = info.getValue();
          if (!dueDate) return <span className="text-muted-foreground">Not set</span>;
          
          const date = new Date(dueDate);
          const isOverdue = date < new Date();
          const formatted = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          
          return (
            <span className={isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
              {formatted}
            </span>
          );
        },
      }),
    ],
    []
  );

  return <DataTable columns={columns} data={tasks} onRowClick={onRowClick} />;
}
