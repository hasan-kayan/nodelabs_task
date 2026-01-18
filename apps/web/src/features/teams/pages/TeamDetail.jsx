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

  // User accepts their own invitation
  const acceptInvitationMutation = useMutation({
    mutationFn: () => teamsAPI.acceptInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['team', id]);
      queryClient.invalidateQueries(['teams']);
      addNotification({
        id: Date.now().toString(),
        message: 'Invitation accepted successfully!',
        type: 'success',
      });
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        return;
      }
      const errorMessage = error.response?.data?.error || 'Failed to accept invitation';
      addNotification({
        id: Date.now().toString(),
        message: errorMessage,
        type: 'error',
      });
    },
  });

  // User rejects their own invitation
  const rejectInvitationMutation = useMutation({
    mutationFn: () => teamsAPI.rejectInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['team', id]);
      queryClient.invalidateQueries(['teams']);
      addNotification({
        id: Date.now().toString(),
        message: 'Invitation rejected successfully!',
        type: 'success',
      });
      navigate('/teams');
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        return;
      }
      const errorMessage = error.response?.data?.error || 'Failed to reject invitation';
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
    m => m.user?._id?.toString() === currentUserId && m.role === 'admin' && m.status === 'approved'
  );
  const isCreator = teamData?.createdBy?._id?.toString() === currentUserId;
  const canManage = isAdmin || isTeamAdmin || isCreator;

  // Check if current user has a pending invitation
  const userPendingInvitation = members.find(m => {
    const memberUserId = m.user?._id?.toString() || m.user?.toString();
    return memberUserId === currentUserId && m.status === 'pending';
  });

  const pendingMembers = members.filter(m => m.status === 'pending' && (m.user?._id?.toString() || m.user?.toString()) !== currentUserId);
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
        {/* Show pending invitation for current user */}
        {userPendingInvitation && (
          <div className="mb-6 p-4 border-2 border-yellow-500 rounded-lg bg-yellow-50">
            <h4 className="text-lg font-semibold mb-2 text-yellow-800">You have a pending invitation</h4>
            <p className="text-sm text-yellow-700 mb-4">
              You've been invited to join this team as a <strong>{userPendingInvitation.role}</strong>.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => acceptInvitationMutation.mutate()}
                disabled={acceptInvitationMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {acceptInvitationMutation.isPending ? 'Accepting...' : 'Accept Invitation'}
              </Button>
              <Button
                variant="outline"
                onClick={() => rejectInvitationMutation.mutate()}
                disabled={rejectInvitationMutation.isPending}
              >
                {rejectInvitationMutation.isPending ? 'Rejecting...' : 'Decline Invitation'}
              </Button>
            </div>
          </div>
        )}

        <div>
          <h3 className="font-semibold mb-4">Team Members</h3>

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
