export const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
};

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
  BLOCKED: 'blocked',
};

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  COMPLETED: 'completed',
};

export const RABBITMQ_TOPICS = {
  OTP_REQUESTED: 'otp.requested',
  TASK_CREATED: 'task.created',
  TASK_ASSIGNED: 'task.assigned',
  TASK_UPDATED: 'task.updated',
  COMMENT_ADDED: 'comment.added',
};
