import logger from '../../utils/logger.js';

export function setupTaskHandlers(socket, io) {
  // Server → client events are emitted from service layer
  // This handler can be extended for client → server events
  
  socket.on('task:subscribe', ({ projectId }) => {
    const room = `project:${projectId}`;
    socket.join(room);
    logger.info(`Socket ${socket.id} subscribed to tasks for project ${projectId}`);
  });

  socket.on('task:unsubscribe', ({ projectId }) => {
    const room = `project:${projectId}`;
    socket.leave(room);
    logger.info(`Socket ${socket.id} unsubscribed from tasks for project ${projectId}`);
  });
}
