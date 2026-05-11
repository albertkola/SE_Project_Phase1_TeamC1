import api from './axios';

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? null;
}

export async function searchTrips(params = {}) {
  const cleaned = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') cleaned[k] = v;
  }
  const res = await api.get('/trips', { params: cleaned });
  const body = unwrap(res);
  return {
    trips: body?.trips || [],
    cached: Boolean(body?.cached),
  };
}

export async function getTripById(id) {
  const res = await api.get(`/trips/${id}`);
  const body = unwrap(res);
  return body?.trip || null;
}

export async function createTrip(payload) {
  const res = await api.post('/trips', payload);
  const body = unwrap(res);
  return body?.trip || null;
}

export async function editTrip(id, payload) {
  const res = await api.patch(`/trips/${id}`, payload);
  const body = unwrap(res);
  return body?.trip || null;
}

export async function cancelTrip(id) {
  const res = await api.patch(`/trips/${id}/cancel`);
  return unwrap(res);
}

export async function getDriverTrips() {
  const res = await api.get('/trips/driver/me');
  const body = unwrap(res);
  return body?.trips || [];
}

export default {
  searchTrips,
  getTripById,
  createTrip,
  editTrip,
  cancelTrip,
  getDriverTrips,
};
