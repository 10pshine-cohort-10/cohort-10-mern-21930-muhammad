import User from '../models/User';
import AppError from '../utils/appError';

export async function getUserById(userId: string): Promise<any> {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user.toJSON();
}
