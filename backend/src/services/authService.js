const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');

function generateToken(userId, email) {
  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT_SECRET is not configured', 500);
  }
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function registerUser(name, email, password) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new AppError('Name is required', 400);
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new AppError('Email is required', 400);
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new AppError('Email is already registered', 409);
  }

  const user = new User({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: password,
  });

  await user.save();
  const token = generateToken(user._id, user.email);

  return { token, user: user.toJSON() };
}

async function loginUser(email, password) {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  /** @type {import('../types').UserDocument | null} */
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user._id, user.email);
  return { token, user: user.toJSON() };
}

module.exports = { registerUser, loginUser, generateToken };
