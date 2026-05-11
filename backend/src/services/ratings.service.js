const db = require('../config/db');
const ratingModel = require('../models/rating.model');
const tripModel = require('../models/trip.model');
const userModel = require('../models/user.model');
const { HttpError } = require('./auth.service');

async function submitRating(reviewer_id, reviewer_role, { trip_id, reviewee_id, stars, review_text }) {
  const trip = await tripModel.findById(trip_id);
  if (!trip) throw new HttpError(404, 'Trip not found');
  if (trip.status !== 'completed') {
    throw new HttpError(409, 'You can only rate after the trip is completed');
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    let resolvedReviewee;
    if (reviewer_role === 'passenger') {
      const { rows } = await client.query(
        `SELECT booking_id FROM bookings
          WHERE trip_id = $1 AND passenger_id = $2 AND status = 'confirmed'`,
        [trip_id, reviewer_id]
      );
      if (rows.length === 0) {
        throw new HttpError(403, 'You did not have a confirmed booking on this trip');
      }
      resolvedReviewee = trip.driver_id;
    } else {
      throw new HttpError(403, 'Only passengers can submit ratings');
    }

    if (resolvedReviewee === reviewer_id) {
      throw new HttpError(400, 'You cannot rate yourself');
    }

    let rating;
    try {
      rating = await ratingModel.create(
        { trip_id, reviewer_id, reviewee_id: resolvedReviewee, stars, review_text },
        client
      );
    } catch (err) {
      if (err.code === '23505') {
        throw new HttpError(409, 'You have already rated this user for this trip');
      }
      throw err;
    }

    await ratingModel.recalculateAverage(resolvedReviewee, client);

    await client.query('COMMIT');
    return rating;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getRatingsForUser(user_id) {
  const user = await userModel.findById(user_id);
  if (!user) throw new HttpError(404, 'User not found');
  const ratings = await ratingModel.findByReviewee(user_id);
  return { user, ratings };
}

module.exports = { submitRating, getRatingsForUser };
