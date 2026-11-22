import { Response, NextFunction } from 'express';
import { getUserById } from '../services/userService';
import { AuthRequest } from '../types';

export async function handleGetCurrentUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await getUserById(req.userId as string);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}
