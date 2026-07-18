const { Redis } = require('@upstash/redis');

let redisClient = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } else {
    console.warn('⚠️ Upstash Redis environment variables not found. Caching will gracefully fallback to direct API fetching.');
  }
} catch (err) {
  console.error('❌ Failed to initialize Upstash Redis:', err.message);
}

/**
 * Global Memory Cache Fallback for Local Dev / Missing Redis
 */
const memCache = new Map();
const MAX_CACHE_SIZE = 5000;

async function getCache(key) {
  if (redisClient) {
    try {
      const data = await redisClient.get(key);
      return data;
    } catch (err) {
      console.warn('Redis GET error:', err.message);
    }
  }
  
  // Fallback to memory
  const entry = memCache.get(key);
  if (entry && Date.now() < entry.expires) {
    return entry.data;
  }
  if (entry) memCache.delete(key);
  return null;
}

async function setCache(key, data, ttlSeconds) {
  if (redisClient) {
    try {
      // Upstash uses ex for seconds
      await redisClient.set(key, data, { ex: ttlSeconds });
      return;
    } catch (err) {
      console.warn('Redis SET error:', err.message);
    }
  }

  // Fallback to memory
  if (memCache.size >= MAX_CACHE_SIZE) {
    const firstKey = memCache.keys().next().value;
    if (firstKey) memCache.delete(firstKey);
  }
  memCache.set(key, { data, expires: Date.now() + (ttlSeconds * 1000) });
}

module.exports = {
  getCache,
  setCache,
  redisClient
};
