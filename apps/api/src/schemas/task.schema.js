export const createTaskSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 1000 },
    status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'blocked'] },
    priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
    projectId: { type: 'string' },
    assignedTo: { type: 'string' },
    tags: {
      type: 'array',
      items: { type: 'string' },
    },
    dueDate: { type: 'string', format: 'date-time' },
  },
  required: ['title', 'projectId'],
  additionalProperties: false,
};

export const updateTaskSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 1000 },
    status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'blocked'] },
    priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
    assignedTo: { type: 'string' },
    tags: {
      type: 'array',
      items: { type: 'string' },
    },
    dueDate: { type: 'string', format: 'date-time' },
  },
  additionalProperties: false,
};
