const pinoHttp = require('pino-http');
const logger = require('../utils/logger');

const requestLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === '/health',
  },
  serializers: {
    req(req) {
      const sanitizedHeaders = { ...req.headers };
      if (sanitizedHeaders.authorization) {
        sanitizedHeaders.authorization = 'Bearer [REDACTED]';
      }
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        query: req.query,
        params: req.params,
        headers: sanitizedHeaders,
        remoteAddress: req.remoteAddress,
        remotePort: req.remotePort,
      };
    },
  },
});

module.exports = requestLogger;
