import { describe, expect, it } from 'vitest';

import { FixedWindowRateLimiter } from './rate-limit';

describe('fixed-window rate limiter', () => {
  it('allows requests up to the configured limit', () => {
    const limiter = new FixedWindowRateLimiter(2, 1_000, () => 100);
    expect(limiter.consume('client')).toMatchObject({ allowed: true, remaining: 1 });
    expect(limiter.consume('client')).toMatchObject({ allowed: true, remaining: 0 });
    expect(limiter.consume('client')).toMatchObject({ allowed: false, remaining: 0 });
  });

  it('isolates callers and resets after the window', () => {
    let now = 100;
    const limiter = new FixedWindowRateLimiter(1, 1_000, () => now);
    expect(limiter.consume('a').allowed).toBe(true);
    expect(limiter.consume('a').allowed).toBe(false);
    expect(limiter.consume('b').allowed).toBe(true);
    now = 1_101;
    expect(limiter.consume('a').allowed).toBe(true);
  });
});
