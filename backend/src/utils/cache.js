const { getClient } = require('../config/redis');

async function get(key) {
  try {
    const client = await getClient();
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('cache.get failed:', err.message);
    return null;
  }
}

async function set(key, value, ttl = 60) {
  try {
    const client = await getClient();
    await client.set(key, JSON.stringify(value), { EX: ttl });
  } catch (err) {
    console.error('cache.set failed:', err.message);
  }
}

async function del(key) {
  try {
    const client = await getClient();
    await client.del(key);
  } catch (err) {
    console.error('cache.del failed:', err.message);
  }
}

function tripSearchKey(origin, destination, date) {
  return `trips:${origin || '*'}:${destination || '*'}:${date || '*'}`;
}

async function invalidateTripCache(origin, destination, date) {
  await del(tripSearchKey(origin, destination, date));
}

async function invalidateAllTripSearches() {
  try {
    const client = await getClient();
    const keys = await client.keys('trips:*');
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (err) {
    console.error('cache.invalidateAllTripSearches failed:', err.message);
  }
}

module.exports = { get, set, del, tripSearchKey, invalidateTripCache, invalidateAllTripSearches };
