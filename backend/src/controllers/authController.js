const { registerUser, loginUser } = require('../services/authService');

async function handleRegister(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const authResult = await registerUser(name, email, password);
    return res.status(201).json({
      success: true,
      data: authResult,
    });
  } catch (err) {
    return next(err);
  }
}

async function handleLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const authResult = await loginUser(email, password);
    return res.status(200).json({
      success: true,
      data: authResult,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { handleRegister, handleLogin };
