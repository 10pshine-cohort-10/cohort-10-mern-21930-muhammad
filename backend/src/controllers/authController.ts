import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/authService';
import AppError from '../utils/appError';

export async function handleRegister(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.body || typeof req.body !== 'object') {
      throw new AppError('Request body is required', 400);
    }
    const { name, email, password } = req.body;
    const authResult = await registerUser(name, email, password);
    res.status(201).json({
      success: true,
      data: authResult,
    });
  } catch (err) {
    next(err);
  }
}

export async function handleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.body || typeof req.body !== 'object') {
      throw new AppError('Request body is required', 400);
    }
    const { email, password } = req.body;
    const authResult = await loginUser(email, password);
    res.status(200).json({
      success: true,
      data: authResult,
    });
  } catch (err) {
    next(err);
  }
}
