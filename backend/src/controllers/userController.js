const { getUserById } = require('../services/userService');

async function handleGetCurrentUser(req, res, next) {
  try {
    const user = await getUserById(req.userId);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { handleGetCurrentUser };
