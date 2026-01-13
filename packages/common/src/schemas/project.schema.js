export const projectStatusSchema = {
  status: {
    type: 'string',
    enum: ['active', 'archived', 'completed'],
  },
};
