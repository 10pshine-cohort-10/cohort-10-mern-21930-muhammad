import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import logger from './utils/logger';
import connectDB from './config/db';
import { initSocket } from './socket/noteSocket';

const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer(): Promise<void> {
  try {
    await connectDB();
    const server = http.createServer(app);
    const socketServer = initSocket(server);

    server.listen(PORT, () => {
      logger.info({ port: PORT, env: process.env.NODE_ENV || 'development' }, 'Server started');
    });

    const shutdownSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    for (const signal of shutdownSignals) {
      process.on(signal, () => {
        logger.info({ signal }, 'Graceful shutdown initiated');

        if (socketServer) {
          socketServer.close();
        }

        server.close(() => {
          logger.info('HTTP server closed');
          process.exit(0);
        });

        setTimeout(() => {
          logger.warn('Forcing shutdown after timeout');
          process.exit(1);
        }, 10000).unref();
      });
    }
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
}

startServer();
