const { body, param } = require('express-validator');

const updateMyProfileRules = [
  body('full_name').optional().trim().notEmpty().withMessage('full_name cannot be empty')
    .isLength({ max: 100 }),
  body('phone').optional().trim().notEmpty().withMessage('phone cannot be empty')
    .isLength({ max: 20 }),
  body('profile_picture').optional({ nullable: true }).isString().isLength({ max: 255 }),
  // Reject any attempt to set protected fields explicitly
  body('email').not().exists().withMessage('email cannot be changed via this endpoint'),
  body('role').not().exists().withMessage('role cannot be changed via this endpoint'),
  body('is_active').not().exists().withMessage('is_active cannot be changed via this endpoint'),
  body('password').not().exists().withMessage('password cannot be changed via this endpoint'),
  body('average_rating').not().exists().withMessage('average_rating is read-only'),
];

const userIdParam = [
  param('id').isInt({ min: 1 }).withMessage('Invalid user id'),
];

module.exports = { updateMyProfileRules, userIdParam };
