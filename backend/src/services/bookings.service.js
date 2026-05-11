const db = require('../config/db');
const bookingModel = require('../models/booking.model');
const tripModel = require('../models/trip.model');
const pickupModel = require('../models/pickup.model');
const notificationsService = require('./notifications.service');
const cache = require('../utils/cache');
const { HttpError } = require('./auth.service');

function formatDate(d) {
  if (!d) return '';
  if (typeof d === 'string') return d.slice(0, 10);
  const date = new Date(d);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function isTripDeparted(trip, client = db) {
  const { rows } = await client.query(
    `SELECT (($1::date::timestamp + $2::time::interval) < (NOW() AT TIME ZONE 'Europe/Tirane')) AS departed`,
    [trip.departure_date, trip.departure_time]
  );
  return rows[0].departed;
}

async function createBooking(passenger_id, { trip_id, pickup_id }) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const trip = await tripModel.findById(trip_id, client);
    if (!trip) throw new HttpError(404, 'Trip not found');
    if (trip.status !== 'active') {
      throw new HttpError(409, 'Trip is not active');
    }
    if (trip.driver_id === passenger_id) {
      throw new HttpError(400, 'You cannot book your own trip');
    }
    if (trip.available_seats <= 0) {
      throw new HttpError(400, 'No seats available');
    }
    if (await isTripDeparted(trip, client)) {
      throw new HttpError(409, 'Trip has already departed');
    }

    const pickup = await pickupModel.findById(pickup_id, client);
    if (!pickup || pickup.trip_id !== trip_id) {
      throw new HttpError(400, 'Pickup point does not belong to this trip');
    }

    const dup = await bookingModel.findDuplicate(passenger_id, trip_id, client);
    if (dup) {
      throw new HttpError(409, 'You already have an active booking for this trip');
    }

    const booking = await bookingModel.create(
      { trip_id, passenger_id, pickup_id },
      client
    );

    const { rows: pRows } = await client.query(
      `SELECT full_name FROM users WHERE user_id = $1`,
      [passenger_id]
    );
    const passengerName = pRows[0]?.full_name || 'A passenger';
    await notificationsService.notify(
      trip.driver_id,
      `New booking request from ${passengerName} for ${trip.departure_city} → ${trip.destination_city} on ${formatDate(trip.departure_date)}.`,
      client
    );

    await client.query('COMMIT');
    return booking;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function approveBooking(booking_id, driver_id) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const booking = await bookingModel.findById(booking_id, client);
    if (!booking) throw new HttpError(404, 'Booking not found');
    if (booking.driver_id !== driver_id) {
      throw new HttpError(403, 'Only the trip driver can approve');
    }
    if (booking.status !== 'pending') {
      throw new HttpError(409, `Booking is already ${booking.status}`);
    }
    if (booking.trip_status !== 'active') {
      throw new HttpError(409, 'Trip is no longer active');
    }

    const trip = await tripModel.adjustAvailableSeats(booking.trip_id, -1, client);
    if (!trip) {
      throw new HttpError(409, 'No seats available to approve this booking');
    }

    const updated = await bookingModel.updateStatus(booking_id, 'confirmed', client);

    await notificationsService.notify(
      booking.passenger_id,
      `Your booking for ${booking.departure_city} → ${booking.destination_city} on ${formatDate(booking.departure_date)} was approved.`,
      client
    );

    await client.query('COMMIT');

    await cache.invalidateAllTripSearches();

    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function rejectBooking(booking_id, driver_id) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const booking = await bookingModel.findById(booking_id, client);
    if (!booking) throw new HttpError(404, 'Booking not found');
    if (booking.driver_id !== driver_id) {
      throw new HttpError(403, 'Only the trip driver can reject');
    }
    if (booking.status !== 'pending') {
      throw new HttpError(409, `Booking is already ${booking.status}`);
    }

    const updated = await bookingModel.updateStatus(booking_id, 'rejected', client);

    await notificationsService.notify(
      booking.passenger_id,
      `Your booking for ${booking.departure_city} → ${booking.destination_city} on ${formatDate(booking.departure_date)} was rejected.`,
      client
    );

    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function cancelBooking(booking_id, passenger_id) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const booking = await bookingModel.findById(booking_id, client);
    if (!booking) throw new HttpError(404, 'Booking not found');
    if (booking.passenger_id !== passenger_id) {
      throw new HttpError(403, 'Only the booking owner can cancel');
    }
    if (booking.status === 'cancelled' || booking.status === 'rejected') {
      throw new HttpError(409, `Booking is already ${booking.status}`);
    }
    if (await isTripDeparted(booking, client)) {
      throw new HttpError(409, 'Cannot cancel after trip departure');
    }

    const wasConfirmed = booking.status === 'confirmed';
    const updated = await bookingModel.updateStatus(booking_id, 'cancelled', client);

    if (wasConfirmed) {
      const restored = await tripModel.adjustAvailableSeats(booking.trip_id, +1, client);
      if (!restored) {
        throw new HttpError(500, 'Failed to restore seat — capacity invariant violated');
      }
      await notificationsService.notify(
        booking.driver_id,
        `${booking.passenger_name} cancelled their seat for ${booking.departure_city} → ${booking.destination_city} on ${formatDate(booking.departure_date)}.`,
        client
      );
    }

    await client.query('COMMIT');

    if (wasConfirmed) {
      await cache.invalidateAllTripSearches();
    }

    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getMyBookings(passenger_id) {
  return bookingModel.findByPassenger(passenger_id);
}

async function getTripBookings(trip_id, driver_id) {
  const trip = await tripModel.findById(trip_id);
  if (!trip) throw new HttpError(404, 'Trip not found');
  if (trip.driver_id !== driver_id) {
    throw new HttpError(403, 'Only the trip driver can view bookings');
  }
  return bookingModel.findByTrip(trip_id);
}

module.exports = {
  createBooking,
  approveBooking,
  rejectBooking,
  cancelBooking,
  getMyBookings,
  getTripBookings,
};
