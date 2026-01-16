export const createTeamSchema = {
  type: 'object',
  properties: {
    name: { 
      type: 'string', 
      minLength: 1, 
      maxLength: 100,
    },
    description: { 
      type: 'string', 
      maxLength: 500,
    },
  },
  required: ['name'],
  additionalProperties: false,
};

export const updateTeamSchema = {
  type: 'object',
  properties: {
    name: { 
      type: 'string', 
      minLength: 1, 
      maxLength: 100,
    },
    description: { 
      type: 'string', 
      maxLength: 500,
    },
  },
  additionalProperties: false,
};

export const inviteMemberSchema = {
  type: 'object',
  properties: {
    email: { 
      type: 'string', 
      format: 'email',
    },
    role: { 
      type: 'string', 
      enum: ['admin', 'member'],
      default: 'member',
    },
  },
  required: ['email'],
  additionalProperties: false,
};

export const approveMemberSchema = {
  type: 'object',
  properties: {
    userId: { 
      type: 'string',
    },
  },
  required: ['userId'],
  additionalProperties: false,
};

export const rejectMemberSchema = {
  type: 'object',
  properties: {
    userId: { 
      type: 'string',
    },
  },
  required: ['userId'],
  additionalProperties: false,
};
