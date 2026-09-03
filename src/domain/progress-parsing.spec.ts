import { describe, expect, it } from 'vitest';

import { parseDiagnosticAnswers, parseProgress } from './progress';

describe('progress input validation', () => {
  it('parses valid progress and supplies level defaults', () => {
    expect(parseProgress('{"totalXP":10,"levels":{"1":{"xp":5}}}')).toEqual({
      totalXP: 10,
      levels: {
        '1': {
          xp: 5,
          lessonsCompleted: [],
          interviewCompleted: false,
          gateScore: null,
          gatePassed: false,
        },
      },
    });
  });

  it.each(['{', 'null', '{"totalXP":-1}', '{"levels":{"1":{"xp":"five"}}}'])(
    'rejects corrupted or invalid progress: %s',
    (value) => expect(parseProgress(value)).toBeNull(),
  );

  it('accepts only diagnostic arrays', () => {
    expect(parseDiagnosticAnswers('[1,{"answer":2}]')).toEqual([1, { answer: 2 }]);
    expect(parseDiagnosticAnswers('{"answer":2}')).toBeNull();
    expect(parseDiagnosticAnswers('bad')).toBeNull();
  });
});
