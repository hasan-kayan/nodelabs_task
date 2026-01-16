import logger from '../utils/logger.js';

export function setupRooms(socket, io) {
  // Project rooms
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

  // Team rooms
  socket.on('team:join', ({ teamId, userId }) => {
    const room = `team:${teamId}`;
    socket.join(room);
    logger.info(`User ${userId} joined team room ${room}`);
    
    socket.emit('team:joined', { room });
  });

  socket.on('team:leave', ({ teamId, userId }) => {
    const room = `team:${teamId}`;
    socket.leave(room);
    logger.info(`User ${userId} left team room ${room}`);
    
    socket.emit('team:left', { room });
  });
}
