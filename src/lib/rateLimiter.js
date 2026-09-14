'use strict';

/**
 * Very small in-memory, per-IP sliding-window rate limiter.
 * No external dependencies -- adequate for a low-traffic lead form
 * endpoint that has no CAPTCHA in front of it.
 */

function createRateLimiter({ windowMs = 60 * 1000, max = 5 } = {}) {
  const hits = new Map(); // ip -> array of timestamps

  // periodic cleanup so the map doesn't grow forever
  setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of hits.entries()) {
      const fresh = timestamps.filter((t) => now - t < windowMs);
      if (fresh.length === 0) {
        hits.delete(ip);
      } else {
        hits.set(ip, fresh);
      }
    }
  }, windowMs).unref?.();

  return function rateLimiter(req, res, next) {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    const timestamps = (hits.get(ip) || []).filter((t) => now - t < windowMs);
    timestamps.push(now);
    hits.set(ip, timestamps);

    if (timestamps.length > max) {
      return res.status(429).json({ ok: false, error: 'Too many requests. Please try again in a minute.' });
    }
    next();
  };
}

module.exports = { createRateLimiter };
