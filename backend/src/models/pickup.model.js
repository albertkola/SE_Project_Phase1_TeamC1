const db = require('../config/db');

async function createMany(trip_id, pickupPoints, client = db) {
  if (!Array.isArray(pickupPoints) || pickupPoints.length === 0) {
    return [];
  }

  const values = [];
  const placeholders = pickupPoints.map((p, i) => {
    const base = i * 3;
    values.push(trip_id, p.location_name, p.pickup_time);
    return `($${base + 1}, $${base + 2}, $${base + 3})`;
  });

  const { rows } = await client.query(
    `INSERT INTO pickup_points (trip_id, location_name, pickup_time)
     VALUES ${placeholders.join(', ')}
     RETURNING pickup_id, trip_id, location_name, pickup_time`,
    values
  );
  return rows;
}

async function findByTrip(trip_id, client = db) {
  const { rows } = await client.query(
    `SELECT pickup_id, trip_id, location_name, pickup_time
       FROM pickup_points
      WHERE trip_id = $1
      ORDER BY pickup_time ASC`,
    [trip_id]
  );
  return rows;
}

async function deleteByTrip(trip_id, client = db) {
  const { rowCount } = await client.query(
    `DELETE FROM pickup_points WHERE trip_id = $1`,
    [trip_id]
  );
  return rowCount;
}

async function findById(pickup_id, client = db) {
  const { rows } = await client.query(
    `SELECT pickup_id, trip_id, location_name, pickup_time
       FROM pickup_points
      WHERE pickup_id = $1`,
    [pickup_id]
  );
  return rows[0] || null;
}

module.exports = { createMany, findByTrip, deleteByTrip, findById };
