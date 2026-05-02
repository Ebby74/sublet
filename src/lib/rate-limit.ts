type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitEntry>();

const DEFAULTS = {
  auth: { windowMs: 15 * 60 * 1000, max: 5 },
  ai: { windowMs: 15 * 60 * 1000, max: 20 },
  api: { windowMs: 15 * 60 * 1000, max: 100 },
} as const;

function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function checkLimit(key: string, windowMs: number, max: number): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }

  if (entry.count >= max) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  entry.count++;
  return { allowed: true, remaining: max - entry.count };
}

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}

setInterval(cleanup, 5 * 60 * 1000);

export function rateLimit(req: Request, type: 'auth' | 'ai' | 'api' = 'api') {
  const config = DEFAULTS[type];
  const ip = getClientIp(req);
  const key = `ratelimit:${type}:${ip}`;
  const result = checkLimit(key, config.windowMs, config.max);

  return {
    ...result,
    limit: config.max,
    windowMs: config.windowMs,
  };
}

export function rateLimitResponse(result: ReturnType<typeof rateLimit>) {
  if (!result.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(result.retryAfter ?? 60),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + (result.retryAfter ?? 60) * 1000),
        },
      }
    );
  }

  return null;
}
