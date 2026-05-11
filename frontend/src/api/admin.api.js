import api from './axios';

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? null;
}

export async function getStats() {
  const res = await api.get('/admin/stats');
  return unwrap(res);
}

export async function getAllUsers(params = {}) {
  const cleaned = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') cleaned[k] = v;
  }
  const res = await api.get('/admin/users', { params: cleaned });
  const body = unwrap(res);
  return {
    users: body?.users || [],
    total: body?.total ?? 0,
    limit: body?.limit ?? 0,
    offset: body?.offset ?? 0,
  };
}

export async function setUserActive(id, isActive) {
  const res = await api.patch(`/admin/users/${id}`, { is_active: isActive });
  const body = unwrap(res);
  return body?.user || null;
}

export async function deleteUser(id) {
  const res = await api.delete(`/admin/users/${id}`);
  return unwrap(res);
}

export async function deleteTrip(id) {
  const res = await api.delete(`/admin/trips/${id}`);
  return unwrap(res);
}

export async function deleteBooking(id) {
  const res = await api.delete(`/admin/bookings/${id}`);
  return unwrap(res);
}

export default {
  getStats,
  getAllUsers,
  setUserActive,
  deleteUser,
  deleteTrip,
  deleteBooking,
};
