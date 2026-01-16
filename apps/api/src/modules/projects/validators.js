export const createProjectSchema = {
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
    status: { 
      type: 'string', 
      enum: ['active', 'archived', 'completed'],
      default: 'active',
    },
    teamId: {
      type: 'string',
    },
    members: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['name'],
  additionalProperties: false,
};

export const updateProjectSchema = {
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
    status: { 
      type: 'string', 
      enum: ['active', 'archived', 'completed'],
    },
    teamId: {
      type: 'string',
    },
    members: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  additionalProperties: false,
};
