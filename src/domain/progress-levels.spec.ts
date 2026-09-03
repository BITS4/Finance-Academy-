import { describe, expect, it } from 'vitest';

import {
  withLevelGateResult,
  withLevelInterviewCompleted,
  withLevelLessonCompleted,
} from './progress';

describe('level progression', () => {
  it('awards lesson XP exactly once and rejects negative XP', () => {
    const first = withLevelLessonCompleted({}, 1, 'lesson-1', 40);
    expect(first.totalXP).toBe(40);
    expect(first.levels?.[1]?.xp).toBe(40);
    expect(withLevelLessonCompleted(first, 1, 'lesson-1', 40)).toBe(first);

    const safe = withLevelLessonCompleted(first, 1, 'lesson-2', -20);
    expect(safe.totalXP).toBe(40);
  });

  it('awards interview XP exactly once', () => {
    const first = withLevelInterviewCompleted({}, 2);
    expect(first.totalXP).toBe(100);
    expect(first.levels?.[2]?.interviewCompleted).toBe(true);
    expect(withLevelInterviewCompleted(first, 2)).toBe(first);
  });

  it('awards gate XP only on the first pass', () => {
    const failed = withLevelGateResult({}, 3, 65, false);
    expect(failed.totalXP).toBe(0);
    expect(failed.levels?.[3]?.gatePassed).toBe(false);

    const passed = withLevelGateResult(failed, 3, 80, true);
    expect(passed.totalXP).toBe(150);
    expect(passed.levels?.[3]?.gateScore).toBe(80);

    const repeated = withLevelGateResult(passed, 3, 95, true);
    expect(repeated.totalXP).toBe(150);
    expect(repeated.levels?.[3]?.xp).toBe(150);
  });
});
