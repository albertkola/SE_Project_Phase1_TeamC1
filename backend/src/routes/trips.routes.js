const express = require('express');

const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const {
  createTripRules,
  editTripRules,
  tripIdParam,
  searchRules,
} = require('../validators/trip.validators');
const controller = require('../controllers/trips.controller');

const router = express.Router();

// All trip endpoints require auth
router.use(auth);

// Driver-scoped — must be defined BEFORE /:id
router.get(
  '/driver/me',
  requireRole('driver'),
  controller.getDriverTrips
);

router.get(
  '/',
  searchRules,
  validate,
  controller.searchTrips
);

router.post(
  '/',
  requireRole('driver'),
  createTripRules,
  validate,
  controller.createTrip
);

router.get(
  '/:id',
  tripIdParam,
  validate,
  controller.getTripById
);

router.patch(
  '/:id',
  requireRole('driver'),
  editTripRules,
  validate,
  controller.editTrip
);

router.patch(
  '/:id/cancel',
  requireRole('driver'),
  tripIdParam,
  validate,
  controller.cancelTrip
);

module.exports = router;
