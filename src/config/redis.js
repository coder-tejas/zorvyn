const { createClient } = require('redis');

let redisClient;

async function connectRedis() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (err) => {
      console.error('Redis error', err.message);
    });

    await redisClient.connect();
  }

  return redisClient;
}

module.exports = {
  connectRedis
};
