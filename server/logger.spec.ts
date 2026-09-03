import { describe, expect, it } from 'vitest';

import { createLogger } from './logger';

describe('structured logger', () => {
  it('creates a redacting pino logger at the requested level', () => {
    const logger = createLogger('silent');
    expect(logger.level).toBe('silent');
    expect(logger.bindings()).toMatchObject({ service: 'finance-academy-api' });
  });
});
