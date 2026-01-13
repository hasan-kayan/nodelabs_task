import logger from '../utils/logger.js';

export function setupRooms(socket, io) {
  socket.on('room:join', ({ projectId, userId }) => {
    const room = `project:${projectId}`;
    socket.join(room);
    logger.info(`User ${userId} joined room ${room}`);
    
    socket.emit('room:joined', { room });
  });

  socket.on('room:leave', ({ projectId, userId }) => {
    const room = `project:${projectId}`;
    socket.leave(room);
    logger.info(`User ${userId} left room ${room}`);
    
    socket.emit('room:left', { room });
  });
}
