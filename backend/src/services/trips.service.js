const db = require('../config/db');
const tripModel = require('../models/trip.model');
const pickupModel = require('../models/pickup.model');
const cache = require('../utils/cache');
const { HttpError } = require('./auth.service');

async function createTrip(driver_id, payload) {
  const {
    departure_city,
    destination_city,
    departure_date,
    departure_time,
    total_seats,
    price_per_seat,
    pickup_points,
  } = payload;

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const trip = await tripModel.create({
      driver_id,
      departure_city,
      destination_city,
      departure_date,
      departure_time,
      total_seats,
      price_per_seat,
    }, client);

    const pickups = await pickupModel.createMany(trip.trip_id, pickup_points, client);

    await client.query('COMMIT');

    await cache.invalidateAllTripSearches();

    return { ...trip, pickup_points: pickups };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getTripById(trip_id) {
  const trip = await tripModel.findById(trip_id);
  if (!trip) throw new HttpError(404, 'Trip not found');
  return trip;
}

async function bookingsExistForTrip(trip_id, client = db) {
  const { rows } = await client.query(
    `SELECT 1 FROM bookings WHERE trip_id = $1 LIMIT 1`,
    [trip_id]
  );
  return rows.length > 0;
}

async function editTrip(trip_id, driver_id, updates) {
  const trip = await tripModel.findById(trip_id);
  if (!trip) throw new HttpError(404, 'Trip not found');
  if (trip.driver_id !== driver_id) {
    throw new HttpError(403, 'You do not own this trip');
  }
  if (trip.status !== 'active') {
    throw new HttpError(409, 'Only active trips can be edited');
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    if (await bookingsExistForTrip(trip_id, client)) {
      throw new HttpError(409, 'Cannot edit a trip that already has bookings');
    }

    const { pickup_points, total_seats, ...rest } = updates;
    const fieldsToUpdate = { ...rest };
    if (total_seats != null) {
      fieldsToUpdate.total_seats = total_seats;
      fieldsToUpdate.available_seats = total_seats;
    }

    let updated = trip;
    if (Object.keys(fieldsToUpdate).length > 0) {
      updated = await tripModel.update(trip_id, fieldsToUpdate, client);
    }

    let pickups;
    if (Array.isArray(pickup_points)) {
      await pickupModel.deleteByTrip(trip_id, client);
      pickups = await pickupModel.createMany(trip_id, pickup_points, client);
    } else {
      pickups = await pickupModel.findByTrip(trip_id, client);
    }

    await client.query('COMMIT');

    await cache.invalidateAllTripSearches();

    return { ...updated, pickup_points: pickups };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function cancelTrip(trip_id, driver_id) {
  const trip = await tripModel.findById(trip_id);
  if (!trip) throw new HttpError(404, 'Trip not found');
  if (trip.driver_id !== driver_id) {
    throw new HttpError(403, 'You do not own this trip');
  }
  if (trip.status === 'cancelled') {
    throw new HttpError(409, 'Trip is already cancelled');
  }
  if (trip.status === 'completed') {
    throw new HttpError(409, 'Cannot cancel a completed trip');
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    await tripModel.cancel(trip_id, client);

    const { rows: confirmed } = await client.query(
      `SELECT booking_id, passenger_id
         FROM bookings
        WHERE trip_id = $1 AND status = 'confirmed'`,
      [trip_id]
    );

    if (confirmed.length > 0) {
      await client.query(
        `UPDATE bookings SET status = 'cancelled'
           WHERE trip_id = $1 AND status IN ('pending', 'confirmed')`,
        [trip_id]
      );

      const message = `Trip from ${trip.departure_city} to ${trip.destination_city} on ${trip.departure_date} was cancelled by the driver.`;
      const placeholders = [];
      const values = [];
      confirmed.forEach((b, i) => {
        const base = i * 2;
        values.push(b.passenger_id, message);
        placeholders.push(`($${base + 1}, $${base + 2})`);
      });
      await client.query(
        `INSERT INTO notifications (user_id, message)
         VALUES ${placeholders.join(', ')}`,
        values
      );
    }

    await client.query(
      `UPDATE trips SET available_seats = total_seats WHERE trip_id = $1`,
      [trip_id]
    );

    await client.query('COMMIT');

    await cache.invalidateAllTripSearches();

    return {
      trip_id,
      status: 'cancelled',
      cancelled_bookings: confirmed.length,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function searchTrips(filters) {
  const key = cache.tripSearchKey(filters.origin, filters.destination, filters.date);
  const hasOnlyKeyedFilters = !filters.maxPrice && !filters.seats && !filters.pickup;

  if (hasOnlyKeyedFilters) {
    const cached = await cache.get(key);
    if (cached) return { trips: cached, cached: true };
  }

  const trips = await tripModel.findMany(filters);

  if (hasOnlyKeyedFilters) {
    await cache.set(key, trips, 60);
  }

  return { trips, cached: false };
}

async function getDriverTrips(driver_id) {
  return tripModel.getByDriver(driver_id);
}

module.exports = {
  createTrip,
  getTripById,
  editTrip,
  cancelTrip,
  searchTrips,
  getDriverTrips,
};
