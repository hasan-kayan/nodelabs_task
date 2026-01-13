import { useMemo } from 'react';
import { DataTable } from '../../../components/common/data-table.jsx';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

export default function TaskTable({ tasks, onRowClick }) {
  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
      }),
      columnHelper.accessor('status', {
        header: 'Status',
      }),
      columnHelper.accessor('priority', {
        header: 'Priority',
      }),
      columnHelper.accessor('assignedTo', {
        header: 'Assigned To',
        cell: (info) => info.getValue()?.name || 'Unassigned',
      }),
    ],
    []
  );

  return <DataTable columns={columns} data={tasks} onRowClick={onRowClick} />;
}
