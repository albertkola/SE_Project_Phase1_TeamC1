const db = require('../config/db');

async function create({ trip_id, reviewer_id, reviewee_id, stars, review_text }, client = db) {
  const { rows } = await client.query(
    `INSERT INTO ratings (trip_id, reviewer_id, reviewee_id, stars, review_text)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING rating_id, trip_id, reviewer_id, reviewee_id, stars, review_text, created_at`,
    [trip_id, reviewer_id, reviewee_id, stars, review_text || null]
  );
  return rows[0];
}

async function findByReviewee(user_id) {
  const { rows } = await db.query(
    `SELECT r.rating_id, r.trip_id, r.reviewer_id, r.reviewee_id,
            r.stars, r.review_text, r.created_at,
            u.full_name AS reviewer_name, u.profile_picture AS reviewer_avatar
       FROM ratings r
       JOIN users u ON u.user_id = r.reviewer_id
      WHERE r.reviewee_id = $1
      ORDER BY r.created_at DESC`,
    [user_id]
  );
  return rows;
}

async function recalculateAverage(user_id, client = db) {
  const { rows } = await client.query(
    `UPDATE users
        SET average_rating = COALESCE(
          (SELECT ROUND(AVG(stars)::numeric, 2) FROM ratings WHERE reviewee_id = $1),
          0.00
        )
      WHERE user_id = $1
      RETURNING user_id, average_rating`,
    [user_id]
  );
  return rows[0] || null;
}

module.exports = { create, findByReviewee, recalculateAverage };
