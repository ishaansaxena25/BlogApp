const { getRedisClient } = require("../config/redis");

class CacheService {
  constructor({ clientProvider = getRedisClient, defaultTtl } = {}) {
    this.clientProvider = clientProvider;
    this.defaultTtl =
      defaultTtl || Number(process.env.CACHE_TTL_SECONDS) || 60;
  }

  async get(key) {
    const client = await this.clientProvider();
    if (!client) return null;

    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key, value, ttl = this.defaultTtl) {
    const client = await this.clientProvider();
    if (!client) return;

    await client.setEx(key, ttl, JSON.stringify(value));
  }

  async delete(...keys) {
    const client = await this.clientProvider();
    if (!client || keys.length === 0) return;

    await client.del(keys);
  }
}

module.exports = CacheService;
