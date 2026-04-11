const NodeCache = require('node-cache');

/**
 * Caching Service
 * Uses node-cache for in-memory caching to avoid repeated DB/API calls.
 * 
 * TTL Defaults:
 * - Search results: 1 hour (3600s)
 * - Company analysis: 24 hours (86400s) 
 * - AI generated content: 12 hours (43200s)
 * 
 * HOW IT WORKS:
 * When a user searches for a company, the results are cached.
 * Subsequent searches for the same company return cached data instantly
 * instead of hitting the database or AI API again.
 */

const cache = new NodeCache({
  stdTTL: 3600,        // Default: 1 hour
  checkperiod: 600,    // Check for expired keys every 10 minutes
  useClones: false,    // For performance, don't clone objects
  maxKeys: 1000,       // Maximum number of keys to prevent memory leaks
});

const cacheService = {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any} Cached value or undefined
   */
  get(key) {
    return cache.get(key);
  },

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   */
  set(key, value, ttl = 3600) {
    cache.set(key, value, ttl);
  },

  /**
   * Delete a specific key from cache
   * @param {string} key - Cache key to delete
   */
  delete(key) {
    cache.del(key);
  },

  /**
   * Clear all cached data
   */
  clear() {
    cache.flushAll();
  },

  /**
   * Get cache statistics
   * @returns {object} Stats including hits, misses, keys count
   */
  getStats() {
    return cache.getStats();
  },

  /**
   * Check if a key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return cache.has(key);
  },

  // Predefined TTL constants (in seconds)
  TTL: {
    SEARCH: 3600,         // 1 hour
    COMPANY: 86400,       // 24 hours
    AI_CONTENT: 43200,    // 12 hours
    POPULAR: 1800,        // 30 minutes
    QUESTIONS: 7200,      // 2 hours
  },
};

module.exports = cacheService;
