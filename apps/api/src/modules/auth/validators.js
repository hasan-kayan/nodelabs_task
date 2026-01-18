export const requestOTPSchema = {
  type: 'object',
  properties: {
    email: { 
      type: 'string', 
      format: 'email',
    },
    phone: { 
      type: 'string', 
      // Accept phone numbers: +1234567890, 05035032333, 1234567890, etc.
      // Minimum 5 digits, maximum 15 digits (with optional + prefix)
      pattern: '^\\+?\\d{5,15}$',
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
  required: ['mode'],
  additionalProperties: false,
};

export const verifyOTPSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    phone: { 
      type: 'string', 
      // Accept phone numbers: +1234567890, 05035032333, 1234567890, etc.
      // Minimum 5 digits, maximum 15 digits (with optional + prefix)
      pattern: '^\\+?\\d{5,15}$',
    },
    otp: { type: 'string', pattern: '^\\d{6}$' },
    mode: { type: 'string', enum: ['login', 'register'], default: 'login' },
    name: { type: 'string', minLength: 1, maxLength: 100 },
  },
  required: ['otp', 'mode'],
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
