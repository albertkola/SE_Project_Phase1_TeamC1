const { body, param, query } = require('express-validator');

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

function isFutureDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('departure_date must be YYYY-MM-DD');
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const provided = new Date(value);
  if (provided < today) {
    throw new Error('departure_date must be today or in the future');
  }
  return true;
}

function differentCities(value, { req }) {
  const a = (req.body.departure_city || '').trim().toLowerCase();
  const b = (value || '').trim().toLowerCase();
  if (a && b && a === b) {
    throw new Error('destination_city must differ from departure_city');
  }
  return true;
}

const pickupPointsRule = body('pickup_points')
  .isArray({ min: 1 }).withMessage('At least one pickup point is required')
  .bail()
  .custom((arr) => {
    for (const p of arr) {
      if (!p || typeof p.location_name !== 'string' || !p.location_name.trim()) {
        throw new Error('Each pickup point requires a non-empty location_name');
      }
      if (!p.pickup_time || !TIME_REGEX.test(p.pickup_time)) {
        throw new Error('Each pickup point requires pickup_time in HH:MM format');
      }
    }
    return true;
  });

const createTripRules = [
  body('departure_city').trim().notEmpty().withMessage('departure_city is required')
    .isLength({ max: 100 }),
  body('destination_city').trim().notEmpty().withMessage('destination_city is required')
    .isLength({ max: 100 })
    .custom(differentCities),
  body('departure_date').notEmpty().withMessage('departure_date is required')
    .bail()
    .custom(isFutureDate),
  body('departure_time').notEmpty().withMessage('departure_time is required')
    .matches(TIME_REGEX).withMessage('departure_time must be HH:MM'),
  body('total_seats').isInt({ min: 1, max: 8 })
    .withMessage('total_seats must be between 1 and 8'),
  body('price_per_seat').isFloat({ min: 50, max: 5000 })
    .withMessage('price_per_seat must be between 50 and 5000')
    .custom((val) => {
      if (val % 10 !== 0) {
        const lower = Math.floor(val / 10) * 10;
        const upper = Math.ceil(val / 10) * 10;
        throw new Error(`price_per_seat must be a multiple of 10 (e.g. ${lower} or ${upper})`);
      }
      return true;
    }),
  pickupPointsRule,
];

const editTripRules = [
  param('id').isInt({ min: 1 }),
  body('departure_city').optional().trim().notEmpty().isLength({ max: 100 }),
  body('destination_city').optional().trim().notEmpty().isLength({ max: 100 }),
  body('departure_date').optional().custom(isFutureDate),
  body('departure_time').optional().matches(TIME_REGEX).withMessage('departure_time must be HH:MM'),
  body('total_seats').optional().isInt({ min: 1, max: 8 }),
  body('price_per_seat').optional().isFloat({ min: 50, max: 5000 })
    .withMessage('price_per_seat must be between 50 and 5000')
    .custom((val) => {
      if (val % 10 !== 0) {
        const lower = Math.floor(val / 10) * 10;
        const upper = Math.ceil(val / 10) * 10;
        throw new Error(`price_per_seat must be a multiple of 10 (e.g. ${lower} or ${upper})`);
      }
      return true;
    }),
  body('pickup_points').optional().isArray({ min: 1 })
    .withMessage('pickup_points must contain at least one item if provided'),
  body('pickup_points.*.location_name').optional().trim().notEmpty(),
  body('pickup_points.*.pickup_time').optional().matches(TIME_REGEX),
];

const tripIdParam = [param('id').isInt({ min: 1 }).withMessage('Invalid trip id')];

const searchRules = [
  query('origin').optional().isString().trim().isLength({ max: 100 }),
  query('destination').optional().isString().trim().isLength({ max: 100 }),
  query('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be YYYY-MM-DD'),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('seats').optional().isInt({ min: 1 }),
  query('pickup').optional().isString().trim().isLength({ max: 150 }),
  query('status').optional().isString().trim(),
];

module.exports = { createTripRules, editTripRules, tripIdParam, searchRules };
