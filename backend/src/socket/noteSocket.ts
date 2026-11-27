import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

let socketServerInstance: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  socketServerInstance = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  socketServerInstance.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required for real-time socket'));
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
      socket.userId = payload.userId;
      return next();
    } catch {
      return next(new Error('Invalid socket authentication token'));
    }
  });

  socketServerInstance.on('connection', (socket: AuthenticatedSocket) => {
    socket.join(`user:${socket.userId}`);
    logger.info({ userId: socket.userId, socketId: socket.id }, 'Socket client connected');

    const tokenCheckInterval = setInterval(() => {
      const socketToken = socket.handshake.auth?.token;
      try {
        jwt.verify(socketToken, process.env.JWT_SECRET as string);
      } catch (err: any) {
        logger.info({ userId: socket.userId, socketId: socket.id, err: err.message }, 'Socket token expired, disconnecting');
        clearInterval(tokenCheckInterval);
        socket.disconnect(true);
      }
    }, 60000);

    socket.on('disconnect', (reason) => {
      clearInterval(tokenCheckInterval);
      logger.info({ userId: socket.userId, reason }, 'Socket client disconnected');
    });
  });

  return socketServerInstance;
}

export function emitNoteChange(userId: string | object, eventName: string, noteData: unknown): void {
  if (socketServerInstance) {
    socketServerInstance.to(`user:${String(userId)}`).emit(eventName, noteData);
  }
}
