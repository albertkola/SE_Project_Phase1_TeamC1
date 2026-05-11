const userModel = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/jwt');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function register({ full_name, email, phone, password, role }) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw new HttpError(409, 'Email is already registered');
  }

  const password_hash = await hashPassword(password);
  const user = await userModel.create({
    full_name,
    email,
    phone,
    password_hash,
    role,
  });

  return user;
}

async function login({ email, password }) {
  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const ok = await comparePassword(password, user.password_hash);
  if (!ok) {
    throw new HttpError(401, 'Invalid email or password');
  }

  if (!user.is_active) {
    throw new HttpError(403, 'Account is deactivated');
  }

  const token = signToken({ user_id: user.user_id, role: user.role });

  const { password_hash, ...safeUser } = user;
  return { token, user: safeUser };
}

module.exports = { register, login, HttpError };
