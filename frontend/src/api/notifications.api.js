import api from './axios';

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? null;
}

export async function getMyNotifications() {
  const res = await api.get('/notifications');
  const body = unwrap(res);
  if (Array.isArray(body)) return body;
  return body?.notifications || [];
}

export async function markRead(id) {
  const res = await api.patch(`/notifications/${id}/read`);
  const body = unwrap(res);
  return body?.notification || null;
}

export async function markAllRead() {
  const res = await api.patch('/notifications/read-all');
  return unwrap(res);
}

export default { getMyNotifications, markRead, markAllRead };
