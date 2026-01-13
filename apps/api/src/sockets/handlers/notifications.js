import logger from '../../utils/logger.js';

export function setupNotificationHandlers(socket, io) {
  socket.on('notification:subscribe', ({ userId }) => {
    const room = `user:${userId}`;
    socket.join(room);
    logger.info(`Socket ${socket.id} subscribed to notifications for user ${userId}`);
  });

  socket.on('notification:unsubscribe', ({ userId }) => {
    const room = `user:${userId}`;
    socket.leave(room);
    logger.info(`Socket ${socket.id} unsubscribed from notifications for user ${userId}`);
  });
}
