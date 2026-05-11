const cron = require('node-cron');
const tripModel = require('../models/trip.model');
const cache = require('./cache');

let task = null;

function start() {
  if (task || process.env.NODE_ENV === 'test') return null;

  task = cron.schedule('*/5 * * * *', async () => {
    try {
      const updated = await tripModel.autoComplete();
      if (updated > 0) {
        console.log(`[autoComplete] marked ${updated} trip(s) as completed`);
        await cache.invalidateAllTripSearches();
      }
    } catch (err) {
      console.error('[autoComplete] failed:', err.message);
    }
  });
  task.start();
  console.log('[autoComplete] cron scheduled (every 5 minutes)');
  return task;
}

function stop() {
  if (task) {
    task.stop();
    task = null;
  }
}

module.exports = { start, stop };
