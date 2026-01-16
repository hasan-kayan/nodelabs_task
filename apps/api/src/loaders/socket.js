import { Server } from 'socket.io';
import { authenticateSocket } from '../middlewares/auth.js';
import { setupSocketHandlers } from '../sockets/index.js';
import logger from '../utils/logger.js';

let io = null;

export function attachSocketIO(server) {
  const corsOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];
  
  io = new Server(server, {
    cors: {
      origin: corsOrigins,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
  });

  // Authentication middleware
  io.use(authenticateSocket);

  // Setup handlers
  setupSocketHandlers(io);

  logger.info('✅ Socket.IO attached');
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}
