export const taskStatusSchema = {
  status: {
    type: 'string',
    enum: ['todo', 'in_progress', 'done', 'blocked'],
  },
};

export const taskPrioritySchema = {
  priority: {
    type: 'string',
    enum: ['low', 'medium', 'high', 'urgent'],
  },
};
