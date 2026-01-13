export const requestOTPSchema = {
  type: 'object',
  properties: {
    email: { 
      type: 'string', 
      format: 'email',
    },
    phone: { 
      type: 'string', 
      pattern: '^\\+?[1-9]\\d{1,14}$',
    },
    mode: { 
      type: 'string', 
      enum: ['login', 'register'],
      default: 'login',
    },
    name: { 
      type: 'string', 
      minLength: 1, 
      maxLength: 100,
    },
  },
  additionalProperties: false,
};

export const verifyOTPSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    phone: { type: 'string', pattern: '^\\+?[1-9]\\d{1,14}$' },
    otp: { type: 'string', pattern: '^\\d{6}$' },
    mode: { type: 'string', enum: ['login', 'register'], default: 'login' },
    name: { type: 'string', minLength: 1, maxLength: 100 },
  },
  required: ['otp'],
  additionalProperties: false,
};

export const refreshTokenSchema = {
  type: 'object',
  properties: {
    refreshToken: { type: 'string' },
  },
  required: ['refreshToken'],
  additionalProperties: false,
};
