const express = require('express');

const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateMyProfileRules, userIdParam } = require('../validators/user.validators');
const controller = require('../controllers/users.controller');

const router = express.Router();

// Authenticated user's own profile (define BEFORE :id to avoid collision)
router.get('/me', auth, controller.getMe);
router.patch('/me', auth, updateMyProfileRules, validate, controller.updateMyProfile);

// Public profile lookup
router.get('/:id', userIdParam, validate, controller.getUserProfile);

module.exports = router;
