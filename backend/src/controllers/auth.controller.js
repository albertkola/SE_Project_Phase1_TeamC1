const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    return res.status(201).json({ success: true, data: { user } });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { token, user } = await authService.login(req.body);
    return res.status(200).json({ success: true, data: { token, user } });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res) {
  return res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
}

module.exports = { register, login, logout };
