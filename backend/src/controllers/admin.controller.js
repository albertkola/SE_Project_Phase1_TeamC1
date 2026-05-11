const adminService = require('../services/admin.service');
const cache = require('../utils/cache');

async function getStats(req, res, next) {
  try {
    const stats = await adminService.getStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    return next(err);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const offset = parseInt(req.query.offset, 10) || 0;
    const result = await adminService.getAllUsers({
      limit,
      offset,
      role: req.query.role,
      search: req.query.search,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { is_active } = req.body;
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_active must be a boolean',
      });
    }
    const user = await adminService.setUserActive(id, is_active);
    return res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    return next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const result = await adminService.deleteUser(parseInt(req.params.id, 10));
    await cache.invalidateAllTripSearches();
    return res.status(200).json({
      success: true,
      data: { ...result, message: 'User deleted' },
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteTrip(req, res, next) {
  try {
    const result = await adminService.deleteTrip(parseInt(req.params.id, 10));
    await cache.invalidateAllTripSearches();
    return res.status(200).json({
      success: true,
      data: { ...result, message: 'Trip deleted' },
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteBooking(req, res, next) {
  try {
    const result = await adminService.deleteBooking(parseInt(req.params.id, 10));
    return res.status(200).json({
      success: true,
      data: { ...result, message: 'Booking deleted' },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getStats,
  getAllUsers,
  updateUser,
  deleteUser,
  deleteTrip,
  deleteBooking,
};
