const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let socketServerInstance = null;

function initSocket(httpServer) {
  socketServerInstance = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  socketServerInstance.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required for real-time socket'));
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.userId;
      return next();
    } catch {
      return next(new Error('Invalid socket authentication token'));
    }
  });

  socketServerInstance.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    logger.info({ userId: socket.userId, socketId: socket.id }, 'Socket client connected');

    const tokenCheckInterval = setInterval(() => {
      const socketToken = socket.handshake.auth?.token;
      try {
        jwt.verify(socketToken, process.env.JWT_SECRET);
      } catch (err) {
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

function emitNoteChange(userId, eventName, noteData) {
  if (socketServerInstance) {
    socketServerInstance.to(`user:${userId}`).emit(eventName, noteData);
  }
}

module.exports = { initSocket, emitNoteChange };
