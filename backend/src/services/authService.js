const jwt = require('jsonwebtoken');
const User = require('../models/User');

function generateToken(userId, email) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function registerUser(name, email, password) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    const err = new Error('Name is required');
    err.status = 400;
    throw err;
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    const err = new Error('Email is required');
    err.status = 400;
    throw err;
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    const err = new Error('Password must be at least 8 characters long');
    err.status = 400;
    throw err;
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    const err = new Error('Email is already registered');
    err.status = 409;
    throw err;
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
    const err = new Error('Email and password are required');
    err.status = 400;
    throw err;
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const token = generateToken(user._id, user.email);
  return { token, user: user.toJSON() };
}

module.exports = { registerUser, loginUser, generateToken };
