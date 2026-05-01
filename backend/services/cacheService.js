// Simple in-memory cache. Replace with Redis for production.
const cache = new Map();

const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

export function setCache(key, value, ttl = DEFAULT_TTL) {
  cache.set(key, {
    value,
    expiry: Date.now() + ttl
  });
}

export function invalidateCache(pattern) {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

// Generate a cache key from dataset info
export function insightCacheKey(datasetId, schemaHash) {
  return `insight:${datasetId}:${schemaHash}`;
}

// Simple hash of schema for cache invalidation
export function hashSchema(schema) {
  const str = JSON.stringify(schema);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}