const User = require('../models/User');
const AppError = require('../utils/appError');

async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user.toJSON();
}

module.exports = { getUserById };
