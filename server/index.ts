import * as Sentry from '@sentry/node';
import { serve } from '@hono/node-server';

import { createApp } from './app';
import { createAssessmentProvider } from './assessment';
import { loadConfig } from './config';
import { createLogger } from './logger';

const config = loadConfig();
const logger = createLogger(config.LOG_LEVEL);

if (config.SENTRY_DSN) {
  Sentry.init({
    dsn: config.SENTRY_DSN,
    environment: config.NODE_ENV,
    tracesSampleRate: config.SENTRY_TRACES_SAMPLE_RATE,
    sendDefaultPii: false,
  });
}

const app = createApp({
  config,
  logger,
  provider: createAssessmentProvider(config),
  captureException: (error, context) => Sentry.captureException(error, { extra: context }),
});

serve({ fetch: app.fetch, port: config.PORT }, ({ port }) => {
  logger.info({ port, environment: config.NODE_ENV }, 'Finance Academy API listening');
});
