import { z } from 'zod';

const assessmentResponseSchema = z.object({
  text: z.string().min(1).max(20_000),
  requestId: z.string().min(1),
});

export const assessmentRequestSchema = z
  .object({
    system: z.string().trim().min(1).max(4_000),
    prompt: z.string().trim().min(1).max(12_000),
  })
  .strict();

export class AssessmentClientError extends Error {
  constructor(
    message: string,
    readonly code: 'configuration' | 'network' | 'response' | 'timeout',
  ) {
    super(message);
    this.name = 'AssessmentClientError';
  }
}

type Fetch = typeof globalThis.fetch;

interface AssessmentClientOptions {
  baseUrl?: string;
  fetchImpl?: Fetch;
  timeoutMs?: number;
}

function normaliseBaseUrl(value: string | undefined): string {
  if (!value) {
    throw new AssessmentClientError('EXPO_PUBLIC_AI_PROXY_URL is not configured.', 'configuration');
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new AssessmentClientError('The AI proxy URL is invalid.', 'configuration');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new AssessmentClientError('The AI proxy must use HTTP or HTTPS.', 'configuration');
  }
  return url.toString().replace(/\/$/, '');
}

export function createAssessmentClient(options: AssessmentClientOptions = {}) {
  const baseUrl = normaliseBaseUrl(options.baseUrl ?? process.env.EXPO_PUBLIC_AI_PROXY_URL);
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const timeoutMs = options.timeoutMs ?? 15_000;

  return async (system: string, prompt: string): Promise<string> => {
    const request = assessmentRequestSchema.parse({ system, prompt });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(`${baseUrl}/v1/assessment`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = z.object({ error: z.object({ message: z.string() }) }).safeParse(body);
        throw new AssessmentClientError(
          message.success ? message.data.error.message : 'Assessment service request failed.',
          'response',
        );
      }

      const parsed = assessmentResponseSchema.safeParse(body);
      if (!parsed.success) {
        throw new AssessmentClientError(
          'Assessment service returned an invalid response.',
          'response',
        );
      }
      return parsed.data.text;
    } catch (error) {
      if (error instanceof AssessmentClientError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AssessmentClientError('Assessment request timed out.', 'timeout');
      }
      throw new AssessmentClientError('Assessment service is unavailable.', 'network');
    } finally {
      clearTimeout(timeout);
    }
  };
}

export async function callClaude(system: string, prompt: string): Promise<string> {
  return createAssessmentClient()(system, prompt);
}
