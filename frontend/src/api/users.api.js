import api from './axios';

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? null;
}

export async function getMe() {
  const res = await api.get('/users/me');
  const body = unwrap(res);
  return body?.user || null;
}

export async function updateMyProfile(payload) {
  const res = await api.patch('/users/me', payload);
  const body = unwrap(res);
  return body?.user || null;
}

export async function getUserProfile(id) {
  const res = await api.get(`/users/${id}`);
  return unwrap(res);
}

export default { getMe, updateMyProfile, getUserProfile };
