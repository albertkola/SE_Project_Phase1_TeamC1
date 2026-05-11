const db = require('../config/db');

async function create({ user_id, message }, client = db) {
  const { rows } = await client.query(
    `INSERT INTO notifications (user_id, message)
     VALUES ($1, $2)
     RETURNING notification_id, user_id, message, is_read, created_at`,
    [user_id, message]
  );
  return rows[0];
}

async function createMany(items, client = db) {
  if (!items || items.length === 0) return [];
  const placeholders = [];
  const values = [];
  items.forEach((it, i) => {
    const base = i * 2;
    values.push(it.user_id, it.message);
    placeholders.push(`($${base + 1}, $${base + 2})`);
  });
  const { rows } = await client.query(
    `INSERT INTO notifications (user_id, message)
     VALUES ${placeholders.join(', ')}
     RETURNING notification_id, user_id, message, is_read, created_at`,
    values
  );
  return rows;
}

async function findByUser(user_id) {
  const { rows } = await db.query(
    `SELECT notification_id, user_id, message, is_read, created_at
       FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [user_id]
  );
  return rows;
}

async function findById(id) {
  const { rows } = await db.query(
    `SELECT notification_id, user_id, message, is_read, created_at
       FROM notifications
      WHERE notification_id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function markRead(id, user_id) {
  const { rows } = await db.query(
    `UPDATE notifications
        SET is_read = true
      WHERE notification_id = $1 AND user_id = $2
      RETURNING notification_id, user_id, message, is_read, created_at`,
    [id, user_id]
  );
  return rows[0] || null;
}

async function markAllRead(user_id) {
  const { rowCount } = await db.query(
    `UPDATE notifications SET is_read = true
       WHERE user_id = $1 AND is_read = false`,
    [user_id]
  );
  return rowCount;
}

module.exports = { create, createMany, findByUser, findById, markRead, markAllRead };
