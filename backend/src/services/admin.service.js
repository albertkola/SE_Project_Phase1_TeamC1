const db = require('../config/db');
const { HttpError } = require('./auth.service');

async function getStats() {
  const [users, trips, bookings, ratings] = await Promise.all([
    db.query(`
      SELECT
        COUNT(*)::int                                           AS total,
        COUNT(*) FILTER (WHERE role = 'driver')::int            AS drivers,
        COUNT(*) FILTER (WHERE role = 'passenger')::int         AS passengers,
        COUNT(*) FILTER (WHERE role = 'admin')::int             AS admins,
        COUNT(*) FILTER (WHERE is_active = false)::int          AS deactivated
      FROM users`),
    db.query(`
      SELECT
        COUNT(*)::int                                          AS total,
        COUNT(*) FILTER (WHERE status = 'active')::int         AS active,
        COUNT(*) FILTER (WHERE status = 'completed')::int      AS completed,
        COUNT(*) FILTER (WHERE status = 'cancelled')::int      AS cancelled
      FROM trips`),
    db.query(`
      SELECT
        COUNT(*)::int                                          AS total,
        COUNT(*) FILTER (WHERE status = 'pending')::int        AS pending,
        COUNT(*) FILTER (WHERE status = 'confirmed')::int      AS confirmed,
        COUNT(*) FILTER (WHERE status = 'rejected')::int       AS rejected,
        COUNT(*) FILTER (WHERE status = 'cancelled')::int      AS cancelled
      FROM bookings`),
    db.query(`SELECT COUNT(*)::int AS total FROM ratings`),
  ]);

  return {
    users: users.rows[0],
    trips: trips.rows[0],
    bookings: bookings.rows[0],
    ratings: ratings.rows[0],
  };
}

async function getAllUsers({ limit = 50, offset = 0, role, search } = {}) {
  const where = [];
  const values = [];

  if (role) {
    values.push(role);
    where.push(`role = $${values.length}`);
  }
  if (search) {
    values.push(`%${search}%`);
    where.push(`(full_name ILIKE $${values.length} OR email ILIKE $${values.length})`);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  values.push(limit, offset);
  const limitIdx = values.length - 1;
  const offsetIdx = values.length;

  const { rows } = await db.query(
    `SELECT user_id, full_name, email, phone, role, profile_picture,
            average_rating, is_active, created_at
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    values
  );

  const countValues = values.slice(0, values.length - 2);
  const { rows: countRows } = await db.query(
    `SELECT COUNT(*)::int AS total FROM users ${whereClause}`,
    countValues
  );

  return { users: rows, total: countRows[0].total, limit, offset };
}

async function setUserActive(id, is_active) {
  const { rows } = await db.query(
    `UPDATE users SET is_active = $2
       WHERE user_id = $1
       RETURNING user_id, full_name, email, role, is_active`,
    [id, is_active]
  );
  if (rows.length === 0) throw new HttpError(404, 'User not found');
  return rows[0];
}

async function deleteUser(id) {
  const { rows } = await db.query(
    `DELETE FROM users WHERE user_id = $1 RETURNING user_id`,
    [id]
  );
  if (rows.length === 0) throw new HttpError(404, 'User not found');
  return { user_id: rows[0].user_id };
}

async function deleteTrip(id) {
  const { rows } = await db.query(
    `DELETE FROM trips WHERE trip_id = $1 RETURNING trip_id`,
    [id]
  );
  if (rows.length === 0) throw new HttpError(404, 'Trip not found');
  return { trip_id: rows[0].trip_id };
}

async function deleteBooking(id) {
  const { rows } = await db.query(
    `DELETE FROM bookings WHERE booking_id = $1 RETURNING booking_id`,
    [id]
  );
  if (rows.length === 0) throw new HttpError(404, 'Booking not found');
  return { booking_id: rows[0].booking_id };
}

module.exports = {
  getStats,
  getAllUsers,
  setUserActive,
  deleteUser,
  deleteTrip,
  deleteBooking,
};
