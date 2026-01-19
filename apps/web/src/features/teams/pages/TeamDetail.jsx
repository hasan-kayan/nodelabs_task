import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { teamsAPI } from '../../../api/teams.api.js';
import { projectsAPI } from '../../../api/projects.api.js';
import { tasksAPI } from '../../../api/tasks.api.js';
import { PageHeader } from '../../../components/common/page-header.jsx';
import { Button } from '../../../components/ui/button.jsx';
import { Input } from '../../../components/ui/input.jsx';
import { Modal } from '../../../components/ui/modal.jsx';
import { useUIStore } from '../../../store/ui.store.js';
import { useAuthStore } from '../../../hooks/use-auth.js';
import { useRole } from '../../../hooks/use-role.js';
import { CreateProjectModal } from '../components/CreateProjectModal.jsx';
import { AssignTaskModal } from '../components/AssignTaskModal.jsx';
import { CheckCircle2, Circle, Clock, XCircle, Plus, User } from 'lucide-react';

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
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [assignTaskModalOpen, setAssignTaskModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const { data: team, isLoading, error } = useQuery({
    queryKey: ['team', id],
    queryFn: () => teamsAPI.getById(id),
  });

  // Fetch projects for this team
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', { teamId: id }],
    queryFn: () => projectsAPI.getAll({ teamId: id, limit: 100 }),
    enabled: !!id,
  });

  const projects = projectsData?.data?.projects || [];


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
        <div className="flex gap-2">
          {canManage && (
            <>
              <Button onClick={() => setInviteModalOpen(true)}>
                Invite Member
              </Button>
              <Button onClick={() => setCreateProjectModalOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </>
          )}
        </div>
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

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Projects</h3>
          </div>
          
          {projectsLoading ? (
            <div className="text-muted-foreground">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-muted-foreground p-4 border rounded">
              {canManage ? 'No projects yet. Create one to get started!' : 'No projects in this team.'}
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <ProjectTasksCard
                  key={project._id}
                  project={project}
                  teamId={id}
                  canManage={canManage}
                  onMemberClick={(member) => {
                    setSelectedMember(member);
                    setAssignTaskModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Team Members Section */}
        <div>
          <h3 className="font-semibold mb-4">Team Members</h3>

          <div>
            <h4 className="text-sm font-medium mb-2">Active Members</h4>
            <div className="space-y-2">
              {approvedMembers.map((member) => (
                <div 
                  key={member.user?._id} 
                  className={`flex items-center justify-between border rounded p-3 ${canManage ? 'cursor-pointer hover:bg-accent transition-colors' : ''}`}
                  onClick={() => {
                    if (canManage) {
                      setSelectedMember({
                        id: member.user?._id,
                        name: member.user?.name || member.user?.email,
                      });
                      setAssignTaskModalOpen(true);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{member.user?.name || member.user?.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Role: {member.role} • Joined: {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {canManage && (
                    <span className="text-xs text-muted-foreground">Click to assign task</span>
                  )}
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

      <CreateProjectModal
        teamId={id}
        open={createProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
      />

      {selectedMember && (
        <AssignTaskModal
          teamId={id}
          userId={selectedMember.id}
          userName={selectedMember.name}
          open={assignTaskModalOpen}
          onClose={() => {
            setAssignTaskModalOpen(false);
            setSelectedMember(null);
          }}
        />
      )}
    </div>
  );
}

// Project Tasks Card Component
function ProjectTasksCard({ project, teamId, canManage, onMemberClick }) {
  const navigate = useNavigate();
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', { projectId: project._id }],
    queryFn: () => tasksAPI.getAll({ projectId: project._id, limit: 50 }),
  });

  const tasks = tasksData?.data?.tasks || [];
  const statusConfig = {
    todo: { label: 'To Do', icon: Circle, color: 'text-gray-500' },
    in_progress: { label: 'In Progress', icon: Clock, color: 'text-blue-500' },
    done: { label: 'Done', icon: CheckCircle2, color: 'text-green-500' },
    blocked: { label: 'Blocked', icon: XCircle, color: 'text-red-500' },
  };

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-lg">{project.name}</h4>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/projects/${project._id}`)}
        >
          View Details
        </Button>
      </div>

      <div className="mt-4">
        <h5 className="text-sm font-medium mb-2 text-muted-foreground">Tasks ({tasks.length})</h5>
        {tasksLoading ? (
          <div className="text-sm text-muted-foreground">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-sm text-muted-foreground p-2">No tasks in this project</div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => {
              const status = statusConfig[task.status] || statusConfig.todo;
              const StatusIcon = status.icon;
              return (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-2 border rounded hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => navigate(`/tasks/${task._id}`)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <StatusIcon className={`h-4 w-4 ${status.color}`} />
                    <span className="text-sm font-medium">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {task.assignedTo && (
                      <span>{task.assignedTo?.name || task.assignedTo?.email}</span>
                    )}
                    {task.priority && (
                      <span className="capitalize">{task.priority}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
