const ratingsService = require('../services/ratings.service');

async function submitRating(req, res, next) {
  try {
    const rating = await ratingsService.submitRating(
      req.user.user_id,
      req.user.role,
      req.body
    );
    return res.status(201).json({ success: true, data: { rating } });
  } catch (err) {
    return next(err);
  }
}

async function getRatingsForUser(req, res, next) {
  try {
    const { user, ratings } = await ratingsService.getRatingsForUser(
      parseInt(req.params.id, 10)
    );
    return res.status(200).json({
      success: true,
      data: {
        user_id: user.user_id,
        full_name: user.full_name,
        average_rating: user.average_rating,
        review_count: ratings.length,
        ratings,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { submitRating, getRatingsForUser };
