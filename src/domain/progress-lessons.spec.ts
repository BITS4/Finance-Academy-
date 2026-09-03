import { describe, expect, it } from 'vitest';

import {
  withExamScore,
  withKebTopicResult,
  withKebTopicStarted,
  withLessonCompleted,
} from './progress';

describe('course and KEB progress', () => {
  it('adds a course lesson once without mutating the original', () => {
    const initial = {};
    const completed = withLessonCompleted(initial, 'accounting', 'lesson-1');
    expect(completed).toEqual({
      courses: { accounting: { lessons: ['lesson-1'], examScore: null } },
    });
    expect(withLessonCompleted(completed, 'accounting', 'lesson-1')).toBe(completed);
    expect(initial).toEqual({});
  });

  it('preserves lessons when saving an exam score', () => {
    const started = withLessonCompleted({}, 'accounting', 'lesson-1');
    expect(withExamScore(started, 'accounting', 84).courses?.accounting).toEqual({
      lessons: ['lesson-1'],
      examScore: 84,
    });
  });

  it('starts a KEB topic idempotently', () => {
    const started = withKebTopicStarted({}, 'budget');
    expect(started.kebTopics?.budget?.lessonsStarted).toBe(true);
    expect(withKebTopicStarted(started, 'budget')).toBe(started);
  });

  it.each([
    { earned: 7, max: 10, expected: 70 },
    { earned: 3, max: 0, expected: 0 },
    { earned: 15, max: 10, expected: 100 },
  ])('normalises KEB score $earned/$max', ({ earned, max, expected }) => {
    const result = withKebTopicResult({}, 'budget', earned, max, expected >= 70, 123);
    expect(result.kebTopics?.budget).toMatchObject({
      examScore: expected,
      lastScore: earned,
      lastAttempt: 123,
    });
  });
});
