// Simple in-memory rate limiter
// For production, consider using Redis or Upstash Rate Limit

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitOptions {
  /**
   * Maximum number of requests allowed
   */
  limit: number
  /**
   * Time window in seconds
   */
  window: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Simple rate limiter based on IP address
 *
 * @param identifier - Unique identifier (usually IP address)
 * @param options - Rate limit options
 * @returns Rate limit result
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 100, window: 60 }
): RateLimitResult {
  const now = Date.now()
  const windowMs = options.window * 1000

  // Get or create rate limit entry
  if (!store[identifier] || store[identifier].resetTime < now) {
    store[identifier] = {
      count: 0,
      resetTime: now + windowMs,
    }
  }

  const entry = store[identifier]
  entry.count++

  const success = entry.count <= options.limit
  const remaining = Math.max(0, options.limit - entry.count)

  return {
    success,
    limit: options.limit,
    remaining,
    reset: Math.ceil(entry.resetTime / 1000),
  }
}

/**
 * Get IP address from request
 *
 * @param request - Next.js request object
 * @returns IP address
 */
export function getIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return ip
}

/**
 * Middleware helper to check rate limit
 *
 * @param request - Next.js request
 * @param options - Rate limit options
 * @returns Response if rate limited, null otherwise
 */
export function checkRateLimit(
  request: Request,
  options?: RateLimitOptions
): Response | null {
  const ip = getIP(request)
  const result = rateLimit(ip, options)

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
        },
      }
    )
  }

  return null
}
