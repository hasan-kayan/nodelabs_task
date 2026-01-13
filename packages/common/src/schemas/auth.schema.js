// Shared validation schemas (can be used with Yup on frontend)
export const emailSchema = {
  email: {
    type: 'string',
    format: 'email',
  },
};

export const phoneSchema = {
  phone: {
    type: 'string',
    pattern: '^\\+?[1-9]\\d{1,14}$',
  },
};
