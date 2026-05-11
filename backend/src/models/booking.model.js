const db = require('../config/db');

const BOOKING_FIELDS = `
  booking_id, trip_id, passenger_id, pickup_id, status, booked_at
`;

async function create({ trip_id, passenger_id, pickup_id }, client = db) {
  const { rows } = await client.query(
    `INSERT INTO bookings (trip_id, passenger_id, pickup_id)
     VALUES ($1, $2, $3)
     RETURNING ${BOOKING_FIELDS}`,
    [trip_id, passenger_id, pickup_id]
  );
  return rows[0];
}

async function findById(id, client = db) {
  const { rows } = await client.query(
    `SELECT b.booking_id, b.trip_id, b.passenger_id, b.pickup_id, b.status, b.booked_at,
            t.driver_id, t.departure_city, t.destination_city,
            t.departure_date, t.departure_time, t.price_per_seat,
            t.total_seats, t.available_seats, t.status AS trip_status,
            u.full_name AS passenger_name, u.average_rating AS passenger_rating,
            u.profile_picture AS passenger_avatar,
            p.location_name AS pickup_location, p.pickup_time
       FROM bookings b
       JOIN trips t ON t.trip_id = b.trip_id
       JOIN users u ON u.user_id = b.passenger_id
       JOIN pickup_points p ON p.pickup_id = b.pickup_id
      WHERE b.booking_id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function findByPassenger(passenger_id) {
  const { rows } = await db.query(
    `SELECT b.booking_id, b.trip_id, b.passenger_id, b.pickup_id, b.status, b.booked_at,
            t.driver_id, t.departure_city, t.destination_city,
            t.departure_date, t.departure_time, t.price_per_seat,
            t.status AS trip_status,
            u.full_name AS driver_name, u.average_rating AS driver_rating,
            u.profile_picture AS driver_avatar,
            p.location_name AS pickup_location, p.pickup_time
       FROM bookings b
       JOIN trips t ON t.trip_id = b.trip_id
       JOIN users u ON u.user_id = t.driver_id
       JOIN pickup_points p ON p.pickup_id = b.pickup_id
      WHERE b.passenger_id = $1
      ORDER BY b.booked_at DESC`,
    [passenger_id]
  );
  return rows;
}

async function findByTrip(trip_id) {
  const { rows } = await db.query(
    `SELECT b.booking_id, b.trip_id, b.passenger_id, b.pickup_id, b.status, b.booked_at,
            u.full_name AS passenger_name, u.email AS passenger_email,
            u.phone AS passenger_phone, u.average_rating AS passenger_rating,
            u.profile_picture AS passenger_avatar,
            p.location_name AS pickup_location, p.pickup_time
       FROM bookings b
       JOIN users u ON u.user_id = b.passenger_id
       JOIN pickup_points p ON p.pickup_id = b.pickup_id
      WHERE b.trip_id = $1
      ORDER BY b.booked_at ASC`,
    [trip_id]
  );
  return rows;
}

async function findDuplicate(passenger_id, trip_id, client = db) {
  const { rows } = await client.query(
    `SELECT booking_id FROM bookings
      WHERE passenger_id = $1
        AND trip_id = $2
        AND status IN ('pending', 'confirmed')
      LIMIT 1`,
    [passenger_id, trip_id]
  );
  return rows[0] || null;
}

async function updateStatus(id, status, client = db) {
  const { rows } = await client.query(
    `UPDATE bookings SET status = $2
       WHERE booking_id = $1
       RETURNING ${BOOKING_FIELDS}`,
    [id, status]
  );
  return rows[0] || null;
}

async function getConfirmedByTrip(trip_id, client = db) {
  const { rows } = await client.query(
    `SELECT booking_id, passenger_id
       FROM bookings
      WHERE trip_id = $1 AND status = 'confirmed'`,
    [trip_id]
  );
  return rows;
}

module.exports = {
  create,
  findById,
  findByPassenger,
  findByTrip,
  findDuplicate,
  updateStatus,
  getConfirmedByTrip,
};
