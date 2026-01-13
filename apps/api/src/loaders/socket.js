import { Server } from 'socket.io';
import { authenticateSocket } from '../middlewares/auth.js';
import { setupSocketHandlers } from '../sockets/index.js';
import logger from '../utils/logger.js';

let io = null;

export function attachSocketIO(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
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
