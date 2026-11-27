import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface ValidationErrorEntry {
  message?: string;
}

interface CustomErrorShape {
  name?: string;
  message?: string;
  status?: number;
  kind?: string;
  code?: number;
  keyPattern?: Record<string, unknown>;
  errors?: Record<string, ValidationErrorEntry>;
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const errorObj = typeof err === 'object' && err !== null ? (err as CustomErrorShape) : {};
  const errorMessage = typeof errorObj.message === 'string' ? errorObj.message : 'Internal server error';

  logger.error({ err, method: req.method, url: req.originalUrl }, errorMessage);

  if (errorObj.name === 'ValidationError' && errorObj.errors && typeof errorObj.errors === 'object') {
    const errorMessages = Object.values(errorObj.errors).map(
      (item: ValidationErrorEntry) => item?.message || 'Validation error'
    );
    res.status(400).json({ success: false, error: errorMessages.join(', ') });
    return;
  }

  if (errorObj.name === 'CastError' && errorObj.kind === 'ObjectId') {
    res.status(400).json({ success: false, error: 'Invalid ID format' });
    return;
  }

  if (errorObj.code === 11000) {
    const duplicateField = Object.keys(errorObj.keyPattern || {})[0] || 'Field';
    res.status(409).json({ success: false, error: `${duplicateField} already exists` });
    return;
  }

  const statusCode = typeof errorObj.status === 'number' ? errorObj.status : 500;
  const message = statusCode === 500 ? 'Internal server error' : errorMessage;
  res.status(statusCode).json({ success: false, error: message });
}

export default errorHandler;
