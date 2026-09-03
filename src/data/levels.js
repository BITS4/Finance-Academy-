// FinanceAcademy — 5-Level IB/CFA/ACCA Learning Track
import level1 from './levels/level1';
import level2 from './levels/level2';
import level3 from './levels/level3';
import level4 from './levels/level4';
import level5 from './levels/level5';

export const LEVELS = [level1, level2, level3, level4, level5];

export function getLevelById(id) {
  return LEVELS.find((level) => level.id === id);
}

export function getLevelProgress(progress, levelId) {
  return (
    progress?.levels?.[levelId] || {
      xp: 0,
      lessonsCompleted: [],
      interviewCompleted: false,
      gateScore: null,
      gatePassed: false,
    }
  );
}

export function getLevelCompletionPct(progress, levelId) {
  const level = getLevelById(levelId);
  if (!level) return 0;
  const levelProgress = getLevelProgress(progress, levelId);
  const lessons = level.modules.flatMap((module) => module.lessons);
  if (!lessons.length) return 0;
  return Math.round((levelProgress.lessonsCompleted.length / lessons.length) * 100);
}

export function isLevelUnlocked(progress, levelId) {
  if (levelId === 1) return true;
  return getLevelProgress(progress, levelId - 1).gatePassed === true;
}

export function getTotalXP(progress) {
  return progress?.totalXP || 0;
}
