import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/authService';

export async function handleRegister(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
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
