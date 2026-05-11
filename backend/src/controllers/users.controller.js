const userModel = require('../models/user.model');
const ratingModel = require('../models/rating.model');

async function getUserProfile(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const ratings = await ratingModel.findByReviewee(id);
    return res.status(200).json({
      success: true,
      data: {
        user_id: user.user_id,
        full_name: user.full_name,
        role: user.role,
        profile_picture: user.profile_picture,
        average_rating: user.average_rating,
        review_count: ratings.length,
        is_active: user.is_active,
        created_at: user.created_at,
        ratings,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const updated = await userModel.updateProfile(req.user.user_id, req.body);
    return res.status(200).json({ success: true, data: { user: updated } });
  } catch (err) {
    return next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await userModel.findById(req.user.user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getUserProfile, updateMyProfile, getMe };
