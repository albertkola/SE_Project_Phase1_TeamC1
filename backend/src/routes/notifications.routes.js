const express = require('express');
const { param } = require('express-validator');

const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const controller = require('../controllers/notifications.controller');

const router = express.Router();

router.use(auth);

router.get('/', controller.getMyNotifications);

router.patch(
  '/read-all',
  controller.markAllRead
);

router.patch(
  '/:id/read',
  param('id').isInt({ min: 1 }),
  validate,
  controller.markRead
);

module.exports = router;
