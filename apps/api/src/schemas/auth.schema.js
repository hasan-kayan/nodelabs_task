export const requestOTPSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    phone: { type: 'string', pattern: '^\\+?[1-9]\\d{1,14}$' },
  },
  oneOf: [
    { required: ['email'] },
    { required: ['phone'] },
  ],
  additionalProperties: false,
};

export const verifyOTPSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    phone: { type: 'string', pattern: '^\\+?[1-9]\\d{1,14}$' },
    otp: { type: 'string', pattern: '^\\d{6}$' },
  },
  required: ['otp'],
  oneOf: [
    { required: ['email'] },
    { required: ['phone'] },
  ],
  additionalProperties: false,
};
