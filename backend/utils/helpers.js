/**
 * Utility Helper Functions
 * Common utilities used across the application.
 */

/**
 * Generate a URL-friendly slug from a string
 * Example: "Tata Consultancy Services" -> "tata-consultancy-services"
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '')    // Remove non-word characters
    .replace(/--+/g, '-')       // Replace multiple hyphens
    .replace(/^-+/, '')         // Trim leading hyphens
    .replace(/-+$/, '');        // Trim trailing hyphens
}

/**
 * Paginate query results
 * @param {number} page - Current page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {object} { skip, limit, page }
 */
function paginate(page = 1, limit = 20) {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  return {
    skip: (p - 1) * l,
    limit: l,
    page: p,
  };
}

/**
 * Create pagination metadata for API responses
 */
function getPaginationMeta(total, page, limit) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}

/**
 * Sanitize user input to prevent injection
 */
function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim();
}

/**
 * Generate a random string for passwords, tokens etc.
 */
function generateRandomString(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = {
  slugify,
  paginate,
  getPaginationMeta,
  sanitizeInput,
  generateRandomString,
};
