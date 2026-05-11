const { body } = require('express-validator');

const registerRules = [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ max: 100 }).withMessage('Full name too long'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .isLength({ max: 150 }).withMessage('Email too long'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .isLength({ max: 20 }).withMessage('Phone too long'),
  body('password')
    .isString().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role')
    .isIn(['driver', 'passenger']).withMessage("Role must be 'driver' or 'passenger'"),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

module.exports = { registerRules, loginRules };
