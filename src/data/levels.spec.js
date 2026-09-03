import { describe, expect, it } from 'vitest';

import {
  LEVELS,
  getLevelById,
  getLevelCompletionPct,
  getLevelProgress,
  getTotalXP,
  isLevelUnlocked,
} from './levels';

describe('learning track data', () => {
  it('contains five complete, uniquely identified levels', () => {
    expect(LEVELS).toHaveLength(5);
    expect(new Set(LEVELS.map((level) => level.id)).size).toBe(5);
    for (const level of LEVELS) {
      expect(level.modules.length).toBeGreaterThan(0);
      expect(level.modules.flatMap((module) => module.lessons).length).toBeGreaterThan(0);
      expect(level.examGate.questions.length).toBeGreaterThanOrEqual(10);
    }
  });

  it('looks up levels and safely handles missing IDs', () => {
    expect(getLevelById(1)?.title).toContain('Основы');
    expect(getLevelById(99)).toBeUndefined();
  });

  it('provides a stable default progress shape', () => {
    expect(getLevelProgress({}, 1)).toEqual({
      xp: 0,
      lessonsCompleted: [],
      interviewCompleted: false,
      gateScore: null,
      gatePassed: false,
    });
  });

  it('calculates completion from the actual lesson count', () => {
    const level = getLevelById(1);
    const lessonIds = level.modules.flatMap((module) => module.lessons).map((lesson) => lesson.id);
    const progress = { levels: { 1: { lessonsCompleted: lessonIds.slice(0, 2) } } };
    expect(getLevelCompletionPct(progress, 1)).toBe(
      Math.round((2 / lessonIds.length) * 100),
    );
    expect(getLevelCompletionPct(progress, 99)).toBe(0);
  });

  it('unlocks levels only after the preceding gate passes', () => {
    expect(isLevelUnlocked({}, 1)).toBe(true);
    expect(isLevelUnlocked({}, 2)).toBe(false);
    expect(isLevelUnlocked({ levels: { 1: { gatePassed: true } } }, 2)).toBe(true);
    expect(getTotalXP({ totalXP: 320 })).toBe(320);
    expect(getTotalXP({})).toBe(0);
  });
});
