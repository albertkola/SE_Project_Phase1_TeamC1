const db = require('../config/db');

const TRIP_FIELDS = `
  trip_id, driver_id, departure_city, destination_city,
  departure_date, departure_time, total_seats, available_seats,
  price_per_seat, status, created_at
`;

async function create({
  driver_id,
  departure_city,
  destination_city,
  departure_date,
  departure_time,
  total_seats,
  price_per_seat,
}, client = db) {
  const { rows } = await client.query(
    `INSERT INTO trips
       (driver_id, departure_city, destination_city, departure_date,
        departure_time, total_seats, available_seats, price_per_seat)
     VALUES ($1, $2, $3, $4, $5, $6, $6, $7)
     RETURNING ${TRIP_FIELDS}`,
    [driver_id, departure_city, destination_city, departure_date,
     departure_time, total_seats, price_per_seat]
  );
  return rows[0];
}

async function findById(id, client = db) {
  const { rows } = await client.query(
    `SELECT t.trip_id, t.driver_id, t.departure_city, t.destination_city,
            t.departure_date, t.departure_time, t.total_seats, t.available_seats,
            t.price_per_seat, t.status, t.created_at,
            u.full_name AS driver_name,
            u.average_rating AS driver_rating,
            u.profile_picture AS driver_avatar
       FROM trips t
       JOIN users u ON u.user_id = t.driver_id
      WHERE t.trip_id = $1`,
    [id]
  );
  if (rows.length === 0) return null;

  const trip = rows[0];
  const pickups = await client.query(
    `SELECT pickup_id, location_name, pickup_time
       FROM pickup_points
      WHERE trip_id = $1
      ORDER BY pickup_time ASC`,
    [id]
  );
  trip.pickup_points = pickups.rows;
  return trip;
}

async function findMany(filters = {}) {
  const where = [];
  const values = [];
  let pickupJoin = '';

  if (filters.status === 'all') {
    // no status filter
  } else if (filters.status) {
    values.push(filters.status);
    where.push(`t.status = $${values.length}`);
  } else {
    where.push(`t.status = 'active'`);
  }

  if (filters.origin) {
    values.push(filters.origin);
    where.push(`LOWER(t.departure_city) = LOWER($${values.length})`);
  }
  if (filters.destination) {
    values.push(filters.destination);
    where.push(`LOWER(t.destination_city) = LOWER($${values.length})`);
  }
  if (filters.date) {
    values.push(filters.date);
    where.push(`t.departure_date = $${values.length}`);
  }
  if (filters.maxPrice != null && filters.maxPrice !== '') {
    values.push(filters.maxPrice);
    where.push(`t.price_per_seat <= $${values.length}`);
  }
  if (filters.seats != null && filters.seats !== '') {
    values.push(filters.seats);
    where.push(`t.available_seats >= $${values.length}`);
  }
  if (filters.pickup) {
    pickupJoin = `JOIN pickup_points pp ON pp.trip_id = t.trip_id`;
    values.push(`%${filters.pickup}%`);
    where.push(`pp.location_name ILIKE $${values.length}`);
  }

  const sql = `
    SELECT DISTINCT t.trip_id, t.driver_id, t.departure_city, t.destination_city,
           t.departure_date, t.departure_time, t.total_seats, t.available_seats,
           t.price_per_seat, t.status, t.created_at,
           u.full_name AS driver_name,
           u.average_rating AS driver_rating,
           u.profile_picture AS driver_avatar
      FROM trips t
      JOIN users u ON u.user_id = t.driver_id
      ${pickupJoin}
      ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY t.departure_date ASC, t.departure_time ASC
  `;

  const { rows } = await db.query(sql, values);
  if (rows.length === 0) return [];

  const tripIds = rows.map((r) => r.trip_id);
  const pickups = await db.query(
    `SELECT pickup_id, trip_id, location_name, pickup_time
       FROM pickup_points
      WHERE trip_id = ANY($1::int[])
      ORDER BY pickup_time ASC`,
    [tripIds]
  );

  const grouped = pickups.rows.reduce((acc, p) => {
    (acc[p.trip_id] = acc[p.trip_id] || []).push({
      pickup_id: p.pickup_id,
      location_name: p.location_name,
      pickup_time: p.pickup_time,
    });
    return acc;
  }, {});

  return rows.map((r) => ({ ...r, pickup_points: grouped[r.trip_id] || [] }));
}

const ALLOWED_UPDATE = [
  'departure_city',
  'destination_city',
  'departure_date',
  'departure_time',
  'total_seats',
  'available_seats',
  'price_per_seat',
];

async function update(id, fields, client = db) {
  const entries = Object.entries(fields).filter(([k]) => ALLOWED_UPDATE.includes(k));
  if (entries.length === 0) return findById(id, client);

  const setClauses = entries.map(([k], i) => `${k} = $${i + 1}`);
  const values = entries.map(([, v]) => v);
  values.push(id);

  const { rows } = await client.query(
    `UPDATE trips SET ${setClauses.join(', ')}
       WHERE trip_id = $${values.length}
       RETURNING ${TRIP_FIELDS}`,
    values
  );
  return rows[0] || null;
}

async function cancel(id, client = db) {
  const { rows } = await client.query(
    `UPDATE trips SET status = 'cancelled'
       WHERE trip_id = $1
       RETURNING ${TRIP_FIELDS}`,
    [id]
  );
  return rows[0] || null;
}

async function getByDriver(driver_id) {
  const { rows } = await db.query(
    `SELECT ${TRIP_FIELDS} FROM trips
       WHERE driver_id = $1
       ORDER BY departure_date DESC, departure_time DESC`,
    [driver_id]
  );
  if (rows.length === 0) return [];

  const tripIds = rows.map((r) => r.trip_id);
  const pickups = await db.query(
    `SELECT pickup_id, trip_id, location_name, pickup_time
       FROM pickup_points
      WHERE trip_id = ANY($1::int[])
      ORDER BY pickup_time ASC`,
    [tripIds]
  );

  const grouped = pickups.rows.reduce((acc, p) => {
    (acc[p.trip_id] = acc[p.trip_id] || []).push({
      pickup_id: p.pickup_id,
      location_name: p.location_name,
      pickup_time: p.pickup_time,
    });
    return acc;
  }, {});

  return rows.map((r) => ({ ...r, pickup_points: grouped[r.trip_id] || [] }));
}

async function autoComplete() {
  const { rowCount } = await db.query(
    `UPDATE trips
        SET status = 'completed'
      WHERE status = 'active'
        AND (departure_date::timestamp + departure_time::interval) < (NOW() AT TIME ZONE 'Europe/Tirane')`
  );
  return rowCount;
}

async function adjustAvailableSeats(trip_id, delta, client = db) {
  const { rows } = await client.query(
    `UPDATE trips
        SET available_seats = available_seats + $1
      WHERE trip_id = $2
        AND available_seats + $1 BETWEEN 0 AND total_seats
      RETURNING ${TRIP_FIELDS}`,
    [delta, trip_id]
  );
  return rows[0] || null;
}

module.exports = {
  create,
  findById,
  findMany,
  update,
  cancel,
  getByDriver,
  autoComplete,
  adjustAvailableSeats,
};
