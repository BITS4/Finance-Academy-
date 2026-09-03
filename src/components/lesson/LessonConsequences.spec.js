import { describe, expect, it } from 'vitest';

import { LEVEL_CONSEQUENCES } from './LessonConsequences';

describe('lesson consequence catalogue', () => {
  it('provides a recoverable failure narrative for every level', () => {
    expect(Object.keys(LEVEL_CONSEQUENCES)).toEqual(['1', '2', '3', '4', '5']);
    for (const consequence of Object.values(LEVEL_CONSEQUENCES)) {
      expect(consequence.title).toBeTruthy();
      expect(consequence.buildFailures.default).toBeTruthy();
      expect(consequence.recovery).toBeTruthy();
    }
  });

  it('retains lesson-specific financial consequences where available', () => {
    expect(LEVEL_CONSEQUENCES[1].buildFailures['1_m1_l1'].pnl).toHaveLength(5);
    expect(LEVEL_CONSEQUENCES[1].buildFailures['1_m1_l2'].impact).toContain('инвестор');
  });
});
