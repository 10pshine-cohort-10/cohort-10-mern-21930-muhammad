import jwt, { SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';
import User from '../models/User';
import AppError from '../utils/appError';
import { AuthSuccessPayload, SerializedUser } from '../types';

export function generateToken(userId: Types.ObjectId | string, email: string): string {
  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT_SECRET is not configured', 500);
  }
  const signOptions: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  };
  return jwt.sign(
    { userId: String(userId), email },
    process.env.JWT_SECRET,
    signOptions
  );
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthSuccessPayload> {
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new AppError('Name is required', 400);
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new AppError('Email is required', 400);
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }

  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw new AppError('Password cannot exceed 72 bytes', 400);
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw new AppError('Email is already registered', 409);
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password,
    });

    const token = generateToken(user._id, user.email);
    await user.save();

    return { token, user: user.toJSON() as unknown as SerializedUser };
  } catch (err) {
    throw err;
  }
}

export async function loginUser(email: string, password: string): Promise<AuthSuccessPayload> {
  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    throw new AppError('Email and password are required', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail) {
    throw new AppError('Email is required', 400);
  }

  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw new AppError('Password cannot exceed 72 bytes', 400);
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(user._id, user.email);
    return { token, user: user.toJSON() as unknown as SerializedUser };
  } catch (err) {
    throw err;
  }
}
