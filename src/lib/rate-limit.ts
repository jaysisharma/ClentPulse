/**
 * In-memory sliding window rate limiter for serverless route handlers.
 * Protects checkout and payment endpoints against automated rapid-fire abuse.
 */

interface RateLimitRecord {
  timestamps: number[]
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Periodically clean up stale entries (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter(t => now - t < 300_000)
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key)
      }
    }
  }, 300_000)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowSeconds: number = 60
): RateLimitResult {
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  let record = rateLimitStore.get(key)
  if (!record) {
    record = { timestamps: [] }
    rateLimitStore.set(key, record)
  }

  // Filter timestamps within the current window
  record.timestamps = record.timestamps.filter(t => now - t < windowMs)

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0]
    const retryAfterMs = oldest + windowMs - now
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    }
  }

  record.timestamps.push(now)
  return {
    allowed: true,
    remaining: limit - record.timestamps.length,
    retryAfterSeconds: 0,
  }
}

export function rateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60_000
): { success: boolean; remaining: number; resetIn: number } {
  const result = checkRateLimit(key, limit, Math.ceil(windowMs / 1000))
  return {
    success: result.allowed,
    remaining: result.remaining,
    resetIn: result.retryAfterSeconds * 1000,
  }
}
