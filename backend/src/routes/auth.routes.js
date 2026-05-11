const express = require('express');
const rateLimit = require('express-rate-limit');

const { registerRules, loginRules } = require('../validators/auth.validators');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const controller = require('../controllers/auth.controller');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth requests. Try again in 15 minutes.',
  },
});

router.post('/register', authLimiter, registerRules, validate, controller.register);
router.post('/login', authLimiter, loginRules, validate, controller.login);
router.post('/logout', auth, controller.logout);

module.exports = router;
