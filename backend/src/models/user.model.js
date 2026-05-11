const db = require('../config/db');

const PUBLIC_FIELDS = `
  user_id, full_name, email, phone, role, profile_picture,
  average_rating, is_active, created_at
`;

async function findByEmail(email) {
  const { rows } = await db.query(
    `SELECT user_id, full_name, email, phone, password_hash, role,
            profile_picture, average_rating, is_active, created_at
       FROM users
      WHERE email = $1`,
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await db.query(
    `SELECT ${PUBLIC_FIELDS} FROM users WHERE user_id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create({ full_name, email, phone, password_hash, role }) {
  const { rows } = await db.query(
    `INSERT INTO users (full_name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${PUBLIC_FIELDS}`,
    [full_name, email, phone, password_hash, role]
  );
  return rows[0];
}

const ALLOWED_UPDATE_FIELDS = ['full_name', 'phone', 'profile_picture', 'is_active'];

async function updateProfile(id, fields) {
  const entries = Object.entries(fields).filter(([k]) =>
    ALLOWED_UPDATE_FIELDS.includes(k)
  );
  if (entries.length === 0) {
    return findById(id);
  }
  const setClauses = entries.map(([k], i) => `${k} = $${i + 1}`);
  const values = entries.map(([, v]) => v);
  values.push(id);

  const { rows } = await db.query(
    `UPDATE users SET ${setClauses.join(', ')}
       WHERE user_id = $${values.length}
       RETURNING ${PUBLIC_FIELDS}`,
    values
  );
  return rows[0] || null;
}

module.exports = { findByEmail, findById, create, updateProfile };
