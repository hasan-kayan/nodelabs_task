import { setupRooms } from './rooms.js';
import { setupTaskHandlers } from './handlers/tasks.js';
import { setupNotificationHandlers } from './handlers/notifications.js';
import logger from '../utils/logger.js';

export function setupSocketHandlers(io) {
  // Namespace for real-time features
  const realtimeIO = io.of('/realtime');

  realtimeIO.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}, user: ${socket.user?.id}`);

    // Setup room management
    setupRooms(socket, realtimeIO);

    // Setup feature handlers
    setupTaskHandlers(socket, realtimeIO);
    setupNotificationHandlers(socket, realtimeIO);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
}
