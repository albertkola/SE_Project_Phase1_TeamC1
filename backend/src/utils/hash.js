const bcrypt = require('bcryptjs');

const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

function hashPassword(password) {
  return bcrypt.hash(password, ROUNDS);
}

function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { hashPassword, comparePassword };
