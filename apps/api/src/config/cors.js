import config from './env.js';

// Get allowed origins
const getAllowedOrigins = () => {
  if (Array.isArray(config.cors.origin)) {
    return config.cors.origin;
  }
  return [config.cors.origin];
};

export const corsConfig = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all localhost origins (any port)
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV || config.nodeEnv === 'development';
    if (isDevelopment) {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:') || origin.startsWith('https://localhost:')) {
        return callback(null, true);
      }
    }
    
    const allowedOrigins = getAllowedOrigins();
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin, 'Allowed:', allowedOrigins, 'NODE_ENV:', process.env.NODE_ENV);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
