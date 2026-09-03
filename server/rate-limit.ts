export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface Entry {
  count: number;
  resetAt: number;
}

export class FixedWindowRateLimiter {
  private entries = new Map<string, Entry>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  consume(key: string): RateLimitResult {
    const now = this.now();
    const existing = this.entries.get(key);
    const entry =
      !existing || existing.resetAt <= now ? { count: 0, resetAt: now + this.windowMs } : existing;
    entry.count += 1;
    this.entries.set(key, entry);

    return {
      allowed: entry.count <= this.limit,
      remaining: Math.max(0, this.limit - entry.count),
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1_000)),
    };
  }
}
