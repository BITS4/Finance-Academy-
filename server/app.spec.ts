import pino from 'pino';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from './app';
import { loadConfig } from './config';
import { MetricsRegistry } from './metrics';
import { FixedWindowRateLimiter } from './rate-limit';

const logger = pino({ enabled: false });
const config = loadConfig({ NODE_ENV: 'test' });
const provider = { assess: vi.fn() };

describe('assessment API', () => {
  beforeEach(() => provider.assess.mockReset().mockResolvedValue('Useful feedback'));

  it('exposes health and Prometheus metrics endpoints', async () => {
    const app = createApp({ config, logger, provider });
    const health = await app.request('/health');
    expect(health.status).toBe(200);
    await expect(health.json()).resolves.toMatchObject({ status: 'ok' });

    const metrics = await app.request('/metrics');
    expect(metrics.headers.get('content-type')).toContain('text/plain');
    expect(await metrics.text()).toContain('finance_academy_http_requests_total');
  });

  it('validates content and rejects unknown fields at the boundary', async () => {
    const app = createApp({ config, logger, provider });
    const response = await app.request('/v1/assessment', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ system: 'coach', prompt: '', secret: 'must not pass' }),
    });
    expect(response.status).toBe(422);
    expect(provider.assess).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON and oversized bodies', async () => {
    const app = createApp({ config, logger, provider });
    const malformed = await app.request('/v1/assessment', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{',
    });
    expect(malformed.status).toBe(400);

    const oversized = await app.request('/v1/assessment', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'content-length': '22000' },
      body: JSON.stringify({ system: 'coach', prompt: 'x'.repeat(21_000) }),
    });
    expect(oversized.status).toBe(413);
  });

  it('returns feedback with a correlation ID and records assessment metrics', async () => {
    const metrics = new MetricsRegistry();
    const app = createApp({ config, logger, provider, metrics, now: () => 100 });
    const response = await app.request('/v1/assessment', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-request-id': 'test-request' },
      body: JSON.stringify({ system: 'coach', prompt: 'Review my answer' }),
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      text: 'Useful feedback',
      requestId: 'test-request',
    });
    expect(provider.assess).toHaveBeenCalledWith({ system: 'coach', prompt: 'Review my answer' });
    expect(metrics.render()).toContain('finance_academy_assessments_total 1');
  });

  it('rate limits callers without leaking provider details', async () => {
    const limiter = new FixedWindowRateLimiter(1, 60_000, () => 0);
    const app = createApp({ config, logger, provider, rateLimiter: limiter });
    const request = () =>
      app.request('/v1/assessment', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.7' },
        body: JSON.stringify({ system: 'coach', prompt: 'answer' }),
      });
    expect((await request()).status).toBe(200);
    const limited = await request();
    expect(limited.status).toBe(429);
    expect(limited.headers.get('retry-after')).toBe('60');
  });

  it('captures unexpected provider failures and returns a stable public error', async () => {
    const failingProvider = {
      assess: async () => {
        throw new Error('upstream key detail');
      },
    };
    const captureException = vi.fn();
    const app = createApp({ config, logger, provider: failingProvider, captureException });
    const response = await app.request('/v1/assessment', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ system: 'coach', prompt: 'answer' }),
    });
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('upstream key detail');
    expect(captureException).toHaveBeenCalledOnce();
  });

  it('returns a typed 404 response', async () => {
    const app = createApp({ config, logger, provider });
    expect((await app.request('/missing')).status).toBe(404);
  });
});
