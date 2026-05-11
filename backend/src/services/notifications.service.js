const notificationModel = require('../models/notification.model');
const { HttpError } = require('./auth.service');

async function notify(user_id, message, client) {
  return notificationModel.create({ user_id, message }, client);
}

async function notifyMany(user_ids, message, client) {
  if (!Array.isArray(user_ids) || user_ids.length === 0) return [];
  const items = user_ids.map((user_id) => ({ user_id, message }));
  return notificationModel.createMany(items, client);
}

async function getMyNotifications(user_id) {
  return notificationModel.findByUser(user_id);
}

async function markRead(notification_id, user_id) {
  const updated = await notificationModel.markRead(notification_id, user_id);
  if (!updated) {
    throw new HttpError(404, 'Notification not found');
  }
  return updated;
}

async function markAllRead(user_id) {
  const count = await notificationModel.markAllRead(user_id);
  return { updated: count };
}

module.exports = { notify, notifyMany, getMyNotifications, markRead, markAllRead };
