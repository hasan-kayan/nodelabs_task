import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { teamsAPI } from '../../../api/teams.api.js';
import { PageHeader } from '../../../components/common/page-header.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Input } from '../../../components/ui/input.jsx';
import { Modal } from '../../../components/ui/modal.jsx';
import { useUIStore } from '../../../store/ui.store.js';
import { useAuthStore } from '../../../hooks/use-auth.js';
import { useRole } from '../../../hooks/use-role.js';

export default function TeamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { isAdmin } = useRole();
  const addNotification = useUIStore((state) => state.addNotification);
  
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  const { data: team, isLoading, error } = useQuery({
    queryKey: ['team', id],
    queryFn: () => teamsAPI.getById(id),
  });

  const inviteMutation = useMutation({
    mutationFn: (data) => teamsAPI.inviteMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['team', id]);
      addNotification({
        id: Date.now().toString(),
        message: 'Invitation sent successfully!',
        type: 'success',
      });
      setInviteModalOpen(false);
      setInviteEmail('');
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        return;
      }
      const errorMessage = error.response?.data?.error || 'Failed to send invitation';
      addNotification({
        id: Date.now().toString(),
        message: errorMessage,
        type: 'error',
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (userId) => teamsAPI.approveMember(id, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['team', id]);
      addNotification({
        id: Date.now().toString(),
        message: 'Member approved successfully!',
        type: 'success',
      });
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        return;
      }
      const errorMessage = error.response?.data?.error || 'Failed to approve member';
      addNotification({
        id: Date.now().toString(),
        message: errorMessage,
        type: 'error',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (userId) => teamsAPI.rejectMember(id, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['team', id]);
      addNotification({
        id: Date.now().toString(),
        message: 'Member rejected successfully!',
        type: 'success',
      });
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        return;
      }
      const errorMessage = error.response?.data?.error || 'Failed to reject member';
      addNotification({
        id: Date.now().toString(),
        message: errorMessage,
        type: 'error',
      });
    },
  });

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      return;
    }
    inviteMutation.mutate({
      email: inviteEmail.trim(),
      role: inviteRole,
    });
  };

  if (error?.response?.status === 401) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Session expired. Redirecting to login...</div>
      </div>
    );
  }

  if (isLoading) return <div>Loading...</div>;

  const teamData = team?.data;
  const members = teamData?.members || [];
  
  // Check if user is team admin
  const currentUserId = user?.id?.toString();
  const isTeamAdmin = members.some(
    m => m.user?._id?.toString() === currentUserId && m.role === 'admin'
  );
  const isCreator = teamData?.createdBy?._id?.toString() === currentUserId;
  const canManage = isAdmin || isTeamAdmin || isCreator;

  const pendingMembers = members.filter(m => m.status === 'pending');
  const approvedMembers = members.filter(m => m.status === 'approved');

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title={teamData?.name}
        description={teamData?.description}
      >
        {canManage && (
          <Button onClick={() => setInviteModalOpen(true)}>
            Invite Member
          </Button>
        )}
      </PageHeader>

      <div className="mt-6 space-y-6">
        <div>
          <h3 className="font-semibold mb-4">Team Members</h3>
          
          {pendingMembers.length > 0 && canManage && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2 text-yellow-600">Pending Invitations</h4>
              <div className="space-y-2">
                {pendingMembers.map((member) => (
                  <div key={member.user?._id} className="flex items-center justify-between border rounded p-3">
                    <div>
                      <p className="font-medium">{member.user?.name || member.user?.email}</p>
                      <p className="text-sm text-muted-foreground">Role: {member.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(member.user._id)}
                        disabled={approveMutation.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectMutation.mutate(member.user._id)}
                        disabled={rejectMutation.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium mb-2">Active Members</h4>
            <div className="space-y-2">
              {approvedMembers.map((member) => (
                <div key={member.user?._id} className="flex items-center justify-between border rounded p-3">
                  <div>
                    <p className="font-medium">{member.user?.name || member.user?.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Role: {member.role} • Joined: {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal open={inviteModalOpen} onClose={() => setInviteModalOpen(false)}>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Invite Team Member</h2>
          
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter member email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteModalOpen(false)}
                disabled={inviteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={inviteMutation.isPending || !inviteEmail.trim()}
              >
                {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
