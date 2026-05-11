const express = require('express');

const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const {
  createBookingRules,
  bookingIdParam,
  tripIdParam,
} = require('../validators/booking.validators');
const controller = require('../controllers/bookings.controller');

const router = express.Router();

router.use(auth);

router.post(
  '/',
  requireRole('passenger'),
  createBookingRules,
  validate,
  controller.createBooking
);

router.get('/me', controller.getMyBookings);

router.get(
  '/trip/:id',
  requireRole('driver'),
  tripIdParam,
  validate,
  controller.getTripBookings
);

router.patch(
  '/:id/approve',
  requireRole('driver'),
  bookingIdParam,
  validate,
  controller.approveBooking
);

router.patch(
  '/:id/reject',
  requireRole('driver'),
  bookingIdParam,
  validate,
  controller.rejectBooking
);

router.patch(
  '/:id/cancel',
  requireRole('passenger'),
  bookingIdParam,
  validate,
  controller.cancelBooking
);

module.exports = router;
