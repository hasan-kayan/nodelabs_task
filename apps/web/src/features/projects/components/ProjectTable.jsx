import { useMemo } from 'react';
import { DataTable } from '../../../components/common/data-table.jsx';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

export default function ProjectTable({ projects, onRowClick }) {
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
      }),
      columnHelper.accessor('status', {
        header: 'Status',
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
    ],
    []
  );

  return <DataTable columns={columns} data={projects} onRowClick={onRowClick} />;
}
