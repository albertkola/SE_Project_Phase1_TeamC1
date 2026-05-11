const notificationsService = require('../services/notifications.service');

async function getMyNotifications(req, res, next) {
  try {
    const notifications = await notificationsService.getMyNotifications(req.user.user_id);
    return res.status(200).json({ success: true, data: { notifications } });
  } catch (err) {
    return next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const notification = await notificationsService.markRead(
      parseInt(req.params.id, 10),
      req.user.user_id
    );
    return res.status(200).json({ success: true, data: { notification } });
  } catch (err) {
    return next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    const result = await notificationsService.markAllRead(req.user.user_id);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getMyNotifications, markRead, markAllRead };
