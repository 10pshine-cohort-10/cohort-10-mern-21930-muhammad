import pinoHttp from 'pino-http';
import logger from '../utils/logger';

export const requestLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === '/health',
  },
  serializers: {
    req(req: any) {
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

export default requestLogger;
