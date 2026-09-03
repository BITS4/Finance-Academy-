import { describe, expect, it } from 'vitest';

import { loadConfig } from './config';

describe('configuration', () => {
  it('provides safe local defaults', () => {
    const config = loadConfig({});
    expect(config.PORT).toBe(8787);
    expect(config.ANTHROPIC_API_KEY).toBeUndefined();
    expect(config.allowedOrigins).toContain('http://localhost:8081');
  });

  it('normalises allowed origins', () => {
    const config = loadConfig({ ALLOWED_ORIGINS: 'https://one.test, https://two.test, ' });
    expect(config.allowedOrigins).toEqual(['https://one.test', 'https://two.test']);
  });

  it('treats blank optional credentials as absent', () => {
    const config = loadConfig({ ANTHROPIC_API_KEY: '', SENTRY_DSN: '' });
    expect(config.ANTHROPIC_API_KEY).toBeUndefined();
    expect(config.SENTRY_DSN).toBeUndefined();
  });

  it.each([{ PORT: '0' }, { PORT: '70000' }, { SENTRY_TRACES_SAMPLE_RATE: '2' }])(
    'rejects invalid environment values: %o',
    (env) => expect(() => loadConfig(env)).toThrow(),
  );
});
