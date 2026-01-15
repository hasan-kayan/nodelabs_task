import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../../../api/users.api.js';
import { DataTable } from '../../../components/common/data-table.jsx';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

export default function SessionsTable() {
  const { data: sessions, error } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => userAPI.getSessions(),
  });

  // Handle 401 errors silently - interceptor will redirect
  if (error?.response?.status === 401) {
    return null; // Don't render anything, redirect will happen
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Session ID',
      }),
      columnHelper.accessor('active', {
        header: 'Status',
        cell: (info) => (info.getValue() ? 'Active' : 'Inactive'),
      }),
    ],
    []
  );

  return <DataTable columns={columns} data={sessions?.data || []} />;
}
