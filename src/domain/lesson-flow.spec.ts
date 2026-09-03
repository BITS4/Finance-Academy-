import { describe, expect, it } from 'vitest';

import { earnedLessonXp, nextLessonPhase, shuffle, visiblePhaseIndex } from './lesson-flow';

describe('lesson flow', () => {
  it('moves through the standard phases', () => {
    expect(nextLessonPhase('hook', false)).toBe('concept');
    expect(nextLessonPhase('concept', false)).toBe('build');
    expect(nextLessonPhase('build', false)).toBe('apply');
    expect(nextLessonPhase('apply', false)).toBe('verdict');
    expect(nextLessonPhase('verdict', false)).toBeNull();
  });

  it('inserts a consequence only after a wrong application answer', () => {
    expect(nextLessonPhase('apply', true)).toBe('consequence');
    expect(nextLessonPhase('consequence', true)).toBe('verdict');
    expect(visiblePhaseIndex('consequence')).toBe(3);
  });

  it.each([
    { xp: 100, wrong: false, expected: 100 },
    { xp: 101, wrong: true, expected: 50 },
    { xp: -20, wrong: false, expected: 0 },
  ])('calculates safe XP for $xp', ({ xp, wrong, expected }) => {
    expect(earnedLessonXp(xp, wrong)).toBe(expected);
  });

  it('shuffles immutably with injectable randomness', () => {
    const source = [1, 2, 3];
    expect(shuffle(source, () => 0)).toEqual([2, 3, 1]);
    expect(source).toEqual([1, 2, 3]);
    expect(shuffle([], () => 0)).toEqual([]);
  });
});
