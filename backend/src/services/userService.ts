import User from '../models/User';
import AppError from '../utils/appError';
import { SerializedUser } from '../types';

export async function getUserById(userId: string): Promise<SerializedUser> {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user.toJSON() as unknown as SerializedUser;
  } catch (err) {
    throw err;
  }
}
