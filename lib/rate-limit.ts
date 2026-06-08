/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Uses a sliding window per IP.
 * Good enough for Groq quota protection without requiring Redis or extra packages.
 *
 * For production with multiple instances, swap this for Upstash Redis or Vercel KV.
 */

interface WindowEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, WindowEntry>();

// Clean up stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

/**
 * Check rate limit for a given identifier (IP or user ID).
 * @param id       - Identifier (IP address or user ID)
 * @param limit    - Max requests allowed in the window
 * @param windowMs - Window duration in milliseconds
 * @returns { allowed: boolean; remaining: number; resetAt: number }
 */
export function checkRateLimit(
  id: string,
  limit: number = 10,
  windowMs: number = 60 * 60 * 1000  // 1 hour default
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = `rl:${id}`;
  let entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { allowed: true, remaining: limit - 1, resetAt: entry.resetAt };
  }

  entry.count++;
  store.set(key, entry);

  if (entry.count > limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/** Extract IP from Next.js request (works behind Render/Vercel proxy) */
export function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
