import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../hooks/use-auth.js';
import { PageHeader } from '../../../components/common/page-header.jsx';
import SessionsTable from '../components/SessionsTable.jsx';

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto p-6">
      <PageHeader title="Profile" description="Manage your account settings" />

      <div className="mt-6 space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Email</h3>
          <p>{user?.email}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Role</h3>
          <p>{user?.role}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Active Sessions</h3>
          <SessionsTable />
        </div>
      </div>
    </div>
  );
}
