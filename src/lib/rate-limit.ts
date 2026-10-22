import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Distributed rate limiter with in-memory fallback.
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL is configured,
 * otherwise falls back to a sliding-window memory store.
 */

interface RateLimitRecord {
  timestamps: number[]
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Periodically clean up stale in-memory entries (every 5 minutes)
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

let upstashRedis: Redis | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    upstashRedis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  } catch (err) {
    console.warn('[RateLimit] Upstash initialization failed, using in-memory fallback:', err)
  }
}

// One limiter per (limit, window) pair so callers' limits are honored under Upstash too
const upstashLimiters = new Map<string, Ratelimit>()

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit | null {
  if (!upstashRedis) return null
  const id = `${limit}:${windowMs}`
  let limiter = upstashLimiters.get(id)
  if (!limiter) {
    limiter = new Ratelimit({
      redis: upstashRedis,
      limiter: Ratelimit.slidingWindow(limit, `${Math.max(1, Math.ceil(windowMs / 1000))} s`),
      prefix: `frevio_rl:${id}`,
      analytics: false,
    })
    upstashLimiters.set(id, limiter)
  }
  return limiter
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export function checkRateLimitMemory(
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

export async function rateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60_000
): Promise<{ success: boolean; remaining: number; resetIn: number }> {
  const upstashLimiter = getUpstashLimiter(limit, windowMs)
  if (upstashLimiter) {
    try {
      const res = await upstashLimiter.limit(key)
      const resetInMs = Math.max(0, res.reset - Date.now())
      return {
        success: res.success,
        remaining: res.remaining,
        resetIn: resetInMs,
      }
    } catch (err) {
      console.warn('[RateLimit] Upstash limit call failed, falling back to memory:', err)
    }
  }

  const mem = checkRateLimitMemory(key, limit, Math.ceil(windowMs / 1000))
  return {
    success: mem.allowed,
    remaining: mem.remaining,
    resetIn: mem.retryAfterSeconds * 1000,
  }
}

// Synchronous compatibility helper
export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowSeconds: number = 60
): RateLimitResult {
  return checkRateLimitMemory(key, limit, windowSeconds)
}
