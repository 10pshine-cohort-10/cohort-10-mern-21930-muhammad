import User from '../models/User';
import Note from '../models/Note';
import AppError from '../utils/appError';
import { deleteUserActivity } from './activityService';
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

export async function deleteUserAccount(userId: string): Promise<{ id: string }> {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  await Note.deleteMany({ userId });
  await deleteUserActivity(userId);
  return { id: userId };
}
