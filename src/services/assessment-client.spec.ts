import { describe, expect, it, vi } from 'vitest';

import { AssessmentClientError, callClaude, createAssessmentClient } from './assessment-client';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('assessment client', () => {
  it('returns validated assessment text', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ text: 'Strong answer', requestId: 'r1' }));
    const assess = createAssessmentClient({ baseUrl: 'https://example.test/', fetchImpl });

    await expect(assess('You are a coach', 'Review this answer')).resolves.toBe('Strong answer');
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://example.test/v1/assessment',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it.each([undefined, '', 'not a url', 'file:///tmp/key'])(
    'rejects an unsafe proxy URL: %s',
    (baseUrl) => {
      expect(() => createAssessmentClient({ baseUrl })).toThrow(AssessmentClientError);
    },
  );

  it('surfaces the safe API error message', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ error: { message: 'Prompt is too long' } }, 422));
    const assess = createAssessmentClient({ baseUrl: 'http://localhost:8787', fetchImpl });

    await expect(assess('system', 'prompt')).rejects.toMatchObject({
      code: 'response',
      message: 'Prompt is too long',
    });
  });

  it('rejects malformed success payloads', async () => {
    const assess = createAssessmentClient({
      baseUrl: 'http://localhost:8787',
      fetchImpl: vi.fn().mockResolvedValue(jsonResponse({ text: '' })),
    });

    await expect(assess('system', 'prompt')).rejects.toMatchObject({ code: 'response' });
  });

  it('normalises transport failures', async () => {
    const assess = createAssessmentClient({
      baseUrl: 'http://localhost:8787',
      fetchImpl: vi.fn().mockRejectedValue(new Error('socket details')),
    });

    await expect(assess('system', 'prompt')).rejects.toMatchObject({ code: 'network' });
  });

  it('handles a non-JSON error body without exposing it', async () => {
    const assess = createAssessmentClient({
      baseUrl: 'http://localhost:8787',
      fetchImpl: vi.fn().mockResolvedValue(new Response('proxy details', { status: 502 })),
    });
    await expect(assess('system', 'prompt')).rejects.toMatchObject({
      code: 'response',
      message: 'Assessment service request failed.',
    });
  });

  it('times out an unresponsive request', async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn(
      (_url, options) =>
        new Promise<Response>((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          );
        }),
    );
    const assess = createAssessmentClient({
      baseUrl: 'http://localhost:8787',
      fetchImpl: fetchImpl as typeof fetch,
      timeoutMs: 10,
    });
    const pending = assess('system', 'prompt');
    const assertion = expect(pending).rejects.toMatchObject({ code: 'timeout' });
    await vi.advanceTimersByTimeAsync(10);
    await assertion;
    vi.useRealTimers();
  });

  it('supports the compatibility callClaude entrypoint', async () => {
    vi.stubEnv('EXPO_PUBLIC_AI_PROXY_URL', 'http://localhost:8787');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ text: 'Compatible', requestId: 'r2' })),
    );
    await expect(callClaude('system', 'prompt')).resolves.toBe('Compatible');
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
});
