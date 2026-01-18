/**
 * Check if a user is a team admin in a specific team
 * @param {Object} team - Team object with populated members
 * @param {string|ObjectId} userId - User ID to check
 * @returns {boolean} - True if user is team admin
 */
export function isTeamAdmin(team, userId) {
  if (!team || !userId) return false;
  
  const userIdStr = userId.toString();
  
  // Check if user is team creator
  const isCreator = team.createdBy?._id?.toString() === userIdStr || 
                    team.createdBy?.toString() === userIdStr;
  
  if (isCreator) return true;
  
  // Check if user is admin member
  const isAdminMember = team.members?.some(
    m => (m.user?._id?.toString() === userIdStr || m.user?.toString() === userIdStr) && 
         m.role === 'admin' && 
         m.status === 'approved'
  );
  
  return !!isAdminMember;
}

/**
 * Check if a user is a member (admin or regular) of a team
 * @param {Object} team - Team object with populated members
 * @param {string|ObjectId} userId - User ID to check
 * @returns {boolean} - True if user is a team member
 */
export function isTeamMember(team, userId) {
  if (!team || !userId) return false;
  
  const userIdStr = userId.toString();
  
  // Check if user is team creator
  const isCreator = team.createdBy?._id?.toString() === userIdStr || 
                    team.createdBy?.toString() === userIdStr;
  
  if (isCreator) return true;
  
  // Check if user is a member (any role, approved status)
  const isMember = team.members?.some(
    m => (m.user?._id?.toString() === userIdStr || m.user?.toString() === userIdStr) && 
         m.status === 'approved'
  );
  
  return !!isMember;
}
