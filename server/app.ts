import { randomUUID } from 'node:crypto';

import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { z } from 'zod';

import type { AssessmentProvider } from './assessment';
import type { AppConfig } from './config';
import type { Logger } from 'pino';
import { MetricsRegistry } from './metrics';
import { FixedWindowRateLimiter } from './rate-limit';

const requestSchema = z
  .object({
    system: z.string().trim().min(1).max(4_000),
    prompt: z.string().trim().min(1).max(12_000),
  })
  .strict();

interface AppDependencies {
  config: AppConfig;
  logger: Logger;
  provider: AssessmentProvider;
  metrics?: MetricsRegistry;
  rateLimiter?: FixedWindowRateLimiter;
  captureException?: (error: unknown, context: Record<string, unknown>) => void;
  now?: () => number;
}

function clientAddress(header: string | undefined): string {
  return header?.split(',')[0]?.trim() || 'unknown';
}

export function createApp(dependencies: AppDependencies) {
  const {
    config,
    logger,
    provider,
    metrics = new MetricsRegistry(),
    rateLimiter = new FixedWindowRateLimiter(20, 60_000),
    captureException = () => undefined,
    now = Date.now,
  } = dependencies;
  const app = new Hono();

  app.use('*', secureHeaders());
  app.use(
    '*',
    cors({
      origin: (origin) =>
        config.allowedOrigins.includes(origin) ? origin : (config.allowedOrigins[0] ?? ''),
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      allowHeaders: ['content-type'],
      maxAge: 600,
    }),
  );
  app.use('*', async (context, next) => {
    const startedAt = now();
    const requestId = context.req.header('x-request-id') || randomUUID();
    context.header('x-request-id', requestId);
    await next();
    const durationMs = Math.max(0, now() - startedAt);
    metrics.recordRequest(context.req.method, context.req.path, context.res.status);
    logger.info(
      {
        requestId,
        method: context.req.method,
        route: context.req.path,
        status: context.res.status,
        durationMs,
      },
      'request completed',
    );
  });

  app.get('/health', (context) =>
    context.json({ status: 'ok', service: 'finance-academy-api', version: '1.1.0' }),
  );
  app.get('/metrics', (context) =>
    context.text(metrics.render(), 200, { 'content-type': 'text/plain; version=0.0.4' }),
  );

  app.post(
    '/v1/assessment',
    bodyLimit({
      maxSize: 20 * 1_024,
      onError: (context) =>
        context.json(
          { error: { code: 'payload_too_large', message: 'Request body is too large.' } },
          413,
        ),
    }),
    async (context) => {
      const requestId = context.res.headers.get('x-request-id') || randomUUID();
      const address = clientAddress(context.req.header('x-forwarded-for'));
      const limit = rateLimiter.consume(address);
      context.header('x-ratelimit-remaining', String(limit.remaining));
      if (!limit.allowed) {
        context.header('retry-after', String(limit.retryAfterSeconds));
        return context.json(
          { error: { code: 'rate_limited', message: 'Too many assessment requests.' } },
          429,
        );
      }

      let body: unknown;
      try {
        body = await context.req.json();
      } catch {
        return context.json(
          { error: { code: 'invalid_json', message: 'Request body must be valid JSON.' } },
          400,
        );
      }
      const parsed = requestSchema.safeParse(body);
      if (!parsed.success) {
        return context.json(
          { error: { code: 'validation_failed', message: 'Assessment input is invalid.' } },
          422,
        );
      }

      const startedAt = now();
      try {
        const text = await provider.assess(parsed.data);
        metrics.recordAssessment(now() - startedAt);
        return context.json({ text, requestId });
      } catch (error) {
        captureException(error, { requestId, route: '/v1/assessment' });
        logger.error({ err: error, requestId }, 'assessment failed');
        return context.json(
          {
            error: {
              code: 'provider_unavailable',
              message: 'Assessment is temporarily unavailable.',
            },
          },
          503,
        );
      }
    },
  );

  app.notFound((context) =>
    context.json({ error: { code: 'not_found', message: 'Route not found.' } }, 404),
  );
  return app;
}
