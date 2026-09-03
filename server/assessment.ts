import { z } from 'zod';

import type { AppConfig } from './config';

const anthropicResponseSchema = z.object({
  content: z.array(z.object({ type: z.string(), text: z.string().optional() })).min(1),
});

export interface AssessmentInput {
  system: string;
  prompt: string;
}

export interface AssessmentProvider {
  assess(input: AssessmentInput): Promise<string>;
}

function offlineAssessment({ prompt }: AssessmentInput): string {
  const words = prompt.trim().split(/\s+/).filter(Boolean).length;
  const detail = words >= 40 ? 'well developed' : words >= 15 ? 'clear but concise' : 'too brief';
  return [
    `Your answer is ${detail} (${words} words).`,
    'Structure it as: conclusion, two supporting points, then one measurable example.',
    'This deterministic local response keeps development and tests independent of external accounts.',
  ].join(' ');
}

export function createAssessmentProvider(
  config: AppConfig,
  fetchImpl: typeof globalThis.fetch = globalThis.fetch,
): AssessmentProvider {
  if (!config.ANTHROPIC_API_KEY) {
    return { assess: async (input) => offlineAssessment(input) };
  }

  return {
    async assess(input) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20_000);
      try {
        const response = await fetchImpl('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': config.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: config.ANTHROPIC_MODEL,
            max_tokens: 1_000,
            system: input.system,
            messages: [{ role: 'user', content: input.prompt }],
          }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Provider returned ${response.status}`);
        const parsed = anthropicResponseSchema.parse(await response.json());
        const text = parsed.content.find((item) => item.type === 'text')?.text;
        if (!text) throw new Error('Provider returned no text');
        return text;
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
