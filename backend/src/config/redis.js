const { createClient } = require('redis');
require('dotenv').config();

const url = process.env.REDIS_URL || 'redis://localhost:6379';

const client = createClient({ url });

client.on('error', (err) => {
  console.error('Redis client error:', err.message);
});

let connecting = null;

async function getClient() {
  if (client.isOpen) return client;
  if (!connecting) {
    connecting = client.connect().catch((err) => {
      console.error('Redis connect failed:', err.message);
      connecting = null;
      throw err;
    });
  }
  await connecting;
  return client;
}

async function disconnect() {
  if (client.isOpen) {
    await client.quit();
  }
}

module.exports = { getClient, disconnect, client };
