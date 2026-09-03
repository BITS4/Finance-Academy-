import { describe, expect, it, vi } from 'vitest';

import { createAssessmentProvider } from './assessment';
import { loadConfig } from './config';

describe('assessment provider', () => {
  it('uses a deterministic offline implementation without credentials', async () => {
    const provider = createAssessmentProvider(loadConfig({ NODE_ENV: 'test' }));
    const text = await provider.assess({ system: 'coach', prompt: 'A concise answer' });
    expect(text).toContain('3 words');
    expect(text).toContain('independent of external accounts');
  });

  it.each([
    { words: 15, label: 'clear but concise' },
    { words: 40, label: 'well developed' },
  ])('grades an offline response with $words words', async ({ words, label }) => {
    const provider = createAssessmentProvider(loadConfig({ NODE_ENV: 'test' }));
    const text = await provider.assess({ system: 'coach', prompt: 'word '.repeat(words) });
    expect(text).toContain(label);
  });

  it('calls the remote provider only when a server-side key is configured', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ content: [{ type: 'text', text: 'Provider feedback' }] }), {
        status: 200,
      }),
    );
    const provider = createAssessmentProvider(
      loadConfig({ ANTHROPIC_API_KEY: 'server-only-key-with-enough-length' }),
      fetchImpl,
    );

    await expect(provider.assess({ system: 'coach', prompt: 'answer' })).resolves.toBe(
      'Provider feedback',
    );
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('rejects invalid provider responses', async () => {
    const provider = createAssessmentProvider(
      loadConfig({ ANTHROPIC_API_KEY: 'server-only-key-with-enough-length' }),
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ content: [] }), { status: 200 })),
    );
    await expect(provider.assess({ system: 'coach', prompt: 'answer' })).rejects.toThrow();
  });

  it('rejects provider responses without text content', async () => {
    const provider = createAssessmentProvider(
      loadConfig({ ANTHROPIC_API_KEY: 'server-only-key-with-enough-length' }),
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ content: [{ type: 'tool_use' }] }), { status: 200 }),
        ),
    );
    await expect(provider.assess({ system: 'coach', prompt: 'answer' })).rejects.toThrow(
      'Provider returned no text',
    );
  });

  it('rejects provider error responses', async () => {
    const provider = createAssessmentProvider(
      loadConfig({ ANTHROPIC_API_KEY: 'server-only-key-with-enough-length' }),
      vi.fn().mockResolvedValue(new Response('unavailable', { status: 503 })),
    );
    await expect(provider.assess({ system: 'coach', prompt: 'answer' })).rejects.toThrow(
      'Provider returned 503',
    );
  });
});
