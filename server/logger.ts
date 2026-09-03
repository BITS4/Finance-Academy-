import pino, { type Logger } from 'pino';

export function createLogger(level = 'info'): Logger {
  return pino({
    level,
    base: { service: 'finance-academy-api' },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'headers.x-api-key',
        'ANTHROPIC_API_KEY',
        '*.password',
        '*.token',
      ],
      censor: '[REDACTED]',
    },
  });
}
