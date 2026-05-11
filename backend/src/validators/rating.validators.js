const { body, param } = require('express-validator');

const submitRatingRules = [
  body('trip_id').isInt({ min: 1 }).withMessage('trip_id is required'),
  body('reviewee_id').optional().isInt({ min: 1 })
    .withMessage('reviewee_id must be an integer'),
  body('stars').isInt({ min: 1, max: 5 }).withMessage('stars must be 1–5'),
  body('review_text').optional().isString().isLength({ max: 1000 })
    .withMessage('review_text must be at most 1000 characters'),
];

const userIdParam = [
  param('id').isInt({ min: 1 }).withMessage('Invalid user id'),
];

module.exports = { submitRatingRules, userIdParam };
