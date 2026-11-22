import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  logger.error({ err, method: req.method, url: req.originalUrl }, err.message);

  if (err.name === 'ValidationError' && err.errors) {
    const errorMessages = Object.values(err.errors).map((item: any) => item.message);
    res.status(400).json({ success: false, error: errorMessages.join(', ') });
    return;
  }

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    res.status(400).json({ success: false, error: 'Invalid ID format' });
    return;
  }

  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyPattern || {})[0] || 'Field';
    res.status(409).json({ success: false, error: `${duplicateField} already exists` });
    return;
  }

  const statusCode = typeof err.status === 'number' ? err.status : 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;
  res.status(statusCode).json({ success: false, error: message });
}

export default errorHandler;
