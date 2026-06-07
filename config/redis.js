const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    connectTimeout: 750,
    reconnectStrategy: false,
  },
});

let connectionAttempted = false;

redisClient.on("error", (error) => {
  console.error("Redis error:", error.message);
});

async function getRedisClient() {
  if (redisClient.isReady) {
    return redisClient;
  }

  if (connectionAttempted) {
    return null;
  }

  connectionAttempted = true;
  try {
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn("Redis unavailable; continuing without cache");
    return null;
  }
}

module.exports = { getRedisClient };
