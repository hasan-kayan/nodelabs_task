import './config/env.js';
import { createServer } from './loaders/express.js';
import { connectMongo } from './config/mongo.js';
import { connectRabbitMQ } from './config/rabbit.js';
import { connectRedis } from './config/redis.js';
import { attachSocketIO } from './loaders/socket.js';
import logger from './utils/logger.js';

const PORT = process.env.API_PORT || 3000;

async function bootstrap() {
  try {
    // Connect to databases
    await connectMongo();
    await connectRabbitMQ();
    await connectRedis();

    // Create Express server
    const { app, server } = createServer();

    // Attach Socket.IO
    attachSocketIO(server);

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 API server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
