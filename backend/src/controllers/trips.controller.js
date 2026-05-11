const tripsService = require('../services/trips.service');

async function createTrip(req, res, next) {
  try {
    const trip = await tripsService.createTrip(req.user.user_id, req.body);
    return res.status(201).json({ success: true, data: { trip } });
  } catch (err) {
    return next(err);
  }
}

async function getTripById(req, res, next) {
  try {
    const trip = await tripsService.getTripById(parseInt(req.params.id, 10));
    return res.status(200).json({ success: true, data: { trip } });
  } catch (err) {
    return next(err);
  }
}

async function searchTrips(req, res, next) {
  try {
    const { trips, cached } = await tripsService.searchTrips(req.query);
    return res.status(200).json({ success: true, data: { trips, cached } });
  } catch (err) {
    return next(err);
  }
}

async function editTrip(req, res, next) {
  try {
    const trip = await tripsService.editTrip(
      parseInt(req.params.id, 10),
      req.user.user_id,
      req.body
    );
    return res.status(200).json({ success: true, data: { trip } });
  } catch (err) {
    return next(err);
  }
}

async function cancelTrip(req, res, next) {
  try {
    const result = await tripsService.cancelTrip(
      parseInt(req.params.id, 10),
      req.user.user_id
    );
    return res.status(200).json({
      success: true,
      data: { ...result, message: 'Trip cancelled' },
    });
  } catch (err) {
    return next(err);
  }
}

async function getDriverTrips(req, res, next) {
  try {
    const trips = await tripsService.getDriverTrips(req.user.user_id);
    return res.status(200).json({ success: true, data: { trips } });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createTrip,
  getTripById,
  searchTrips,
  editTrip,
  cancelTrip,
  getDriverTrips,
};
