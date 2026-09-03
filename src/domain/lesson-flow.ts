export const VISIBLE_LESSON_PHASES = ['hook', 'concept', 'build', 'apply', 'verdict'] as const;

export type LessonPhase = (typeof VISIBLE_LESSON_PHASES)[number] | 'consequence';

export function nextLessonPhase(phase: LessonPhase, applyWasWrong: boolean): LessonPhase | null {
  if (phase === 'apply') return applyWasWrong ? 'consequence' : 'verdict';
  if (phase === 'consequence') return 'verdict';
  const index = VISIBLE_LESSON_PHASES.indexOf(phase as (typeof VISIBLE_LESSON_PHASES)[number]);
  return VISIBLE_LESSON_PHASES[index + 1] ?? null;
}

export function visiblePhaseIndex(phase: LessonPhase): number {
  return VISIBLE_LESSON_PHASES.indexOf(phase === 'consequence' ? 'apply' : phase);
}

export function earnedLessonXp(baseXp: number, applyWasWrong: boolean): number {
  const safeXp = Math.max(0, Math.floor(baseXp));
  return applyWasWrong ? Math.floor(safeXp * 0.5) : safeXp;
}

export function shuffle<T>(values: readonly T[], random: () => number = Math.random): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target]!, result[index]!];
  }
  return result;
}
