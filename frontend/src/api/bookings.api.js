import api from './axios';

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? null;
}

export async function createBooking(payload) {
  const res = await api.post('/bookings', payload);
  const body = unwrap(res);
  return body?.booking || null;
}

export async function getMyBookings() {
  const res = await api.get('/bookings/me');
  const body = unwrap(res);
  return body?.bookings || [];
}

export async function getTripBookings(tripId) {
  const res = await api.get(`/bookings/trip/${tripId}`);
  const body = unwrap(res);
  return body?.bookings || [];
}

export async function approveBooking(id) {
  const res = await api.patch(`/bookings/${id}/approve`);
  const body = unwrap(res);
  return body?.booking || null;
}

export async function rejectBooking(id) {
  const res = await api.patch(`/bookings/${id}/reject`);
  const body = unwrap(res);
  return body?.booking || null;
}

export async function cancelBooking(id) {
  const res = await api.patch(`/bookings/${id}/cancel`);
  const body = unwrap(res);
  return body?.booking || null;
}

export default {
  createBooking,
  getMyBookings,
  getTripBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
};
