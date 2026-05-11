import api from './axios';

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? null;
}

export async function submitRating({ trip_id, reviewee_id, stars, review_text }) {
  const payload = { trip_id, stars };
  if (reviewee_id != null) payload.reviewee_id = reviewee_id;
  if (review_text && review_text.trim()) payload.review_text = review_text.trim();
  const res = await api.post('/ratings', payload);
  const body = unwrap(res);
  return body?.rating || null;
}

export async function getRatingsForUser(userId) {
  const res = await api.get(`/ratings/user/${userId}`);
  return unwrap(res);
}

export default { submitRating, getRatingsForUser };
