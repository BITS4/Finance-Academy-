import { describe, expect, it } from 'vitest';

import { calculateQuizResult, scoreBand } from './assessment';

describe('assessment scoring', () => {
  it('scores answers and de-duplicates weak topics in answer order', () => {
    expect(
      calculateQuizResult([
        { selected: 0, correct: 0, topic: 'DCF' },
        { selected: 1, correct: 2, topic: 'WACC' },
        { selected: 0, correct: 2, topic: 'WACC' },
        { selected: 3, correct: 2, topic: 'Comps' },
      ]),
    ).toEqual({ score: 1, total: 4, weakTopics: ['WACC', 'Comps'] });
  });

  it.each([
    { score: 4, total: 5, expected: 'strong' },
    { score: 3, total: 5, expected: 'developing' },
    { score: 2, total: 5, expected: 'needs-review' },
    { score: 0, total: 0, expected: 'needs-review' },
  ])('maps $score/$total to $expected', ({ score, total, expected }) => {
    expect(scoreBand(score, total)).toBe(expected);
  });
});
