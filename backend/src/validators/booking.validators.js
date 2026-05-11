const { body, param } = require('express-validator');

const createBookingRules = [
  body('trip_id').isInt({ min: 1 }).withMessage('trip_id is required'),
  body('pickup_id').isInt({ min: 1 }).withMessage('pickup_id is required'),
];

const bookingIdParam = [
  param('id').isInt({ min: 1 }).withMessage('Invalid booking id'),
];

const tripIdParam = [
  param('id').isInt({ min: 1 }).withMessage('Invalid trip id'),
];

module.exports = { createBookingRules, bookingIdParam, tripIdParam };
