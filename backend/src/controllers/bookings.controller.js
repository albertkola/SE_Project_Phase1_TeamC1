const bookingsService = require('../services/bookings.service');

async function createBooking(req, res, next) {
  try {
    const booking = await bookingsService.createBooking(req.user.user_id, req.body);
    return res.status(201).json({ success: true, data: { booking } });
  } catch (err) {
    return next(err);
  }
}

async function getMyBookings(req, res, next) {
  try {
    const bookings = await bookingsService.getMyBookings(req.user.user_id);
    return res.status(200).json({ success: true, data: { bookings } });
  } catch (err) {
    return next(err);
  }
}

async function getTripBookings(req, res, next) {
  try {
    const bookings = await bookingsService.getTripBookings(
      parseInt(req.params.id, 10),
      req.user.user_id
    );
    return res.status(200).json({ success: true, data: { bookings } });
  } catch (err) {
    return next(err);
  }
}

async function approveBooking(req, res, next) {
  try {
    const booking = await bookingsService.approveBooking(
      parseInt(req.params.id, 10),
      req.user.user_id
    );
    return res.status(200).json({ success: true, data: { booking } });
  } catch (err) {
    return next(err);
  }
}

async function rejectBooking(req, res, next) {
  try {
    const booking = await bookingsService.rejectBooking(
      parseInt(req.params.id, 10),
      req.user.user_id
    );
    return res.status(200).json({ success: true, data: { booking } });
  } catch (err) {
    return next(err);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const booking = await bookingsService.cancelBooking(
      parseInt(req.params.id, 10),
      req.user.user_id
    );
    return res.status(200).json({ success: true, data: { booking } });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createBooking,
  getMyBookings,
  getTripBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
};
