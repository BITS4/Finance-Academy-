import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEY = 'fa-progress';
const DIAGNOSTIC_ANSWERS_KEY = 'fa-diagnostic-answers';

export async function loadProgress() {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      console.warn('Progress data corrupted, resetting.');
      await AsyncStorage.removeItem(PROGRESS_KEY);
      return {};
    }
  } catch (e) {
    console.warn('Failed to load progress:', e);
    return {};
  }
}

export async function saveProgress(progress) {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    return true;
  } catch (e) {
    console.warn('Failed to save progress:', e);
    return false;
  }
}

export async function markLessonDone(progress, courseId, lessonId) {
  const updated = { ...progress };
  if (!updated[courseId]) updated[courseId] = { lessons: [], examScore: null };
  if (!updated[courseId].lessons.includes(lessonId)) {
    updated[courseId] = {
      ...updated[courseId],
      lessons: [...updated[courseId].lessons, lessonId],
    };
  }
  await saveProgress(updated);
  return updated;
}

export async function saveExamScore(progress, courseId, score) {
  const updated = {
    ...progress,
    [courseId]: {
      ...(progress[courseId] || { lessons: [] }),
      examScore: score,
    },
  };
  await saveProgress(updated);
  return updated;
}

// ─── Диагностика ────────────────────────────────────────────

export async function saveDiagnosticAnswers(answers) {
  try {
    await AsyncStorage.setItem(DIAGNOSTIC_ANSWERS_KEY, JSON.stringify(answers));
  } catch (e) {
    console.warn('Failed to save diagnostic answers:', e);
  }
}

export async function loadDiagnosticAnswers() {
  try {
    const raw = await AsyncStorage.getItem(DIAGNOSTIC_ANSWERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ─── КЭБ прогресс ───────────────────────────────────────────

export async function saveKebTopicResult(progress, topicId, earned, maxScore, passed) {
  const pct = maxScore ? Math.round((earned / maxScore) * 100) : 0;
  const updated = {
    ...progress,
    kebTopics: {
      ...(progress.kebTopics || {}),
      [topicId]: {
        lessonsStarted: true,
        examPassed: passed,
        examScore: pct,
        lastScore: earned,
        lastAttempt: Date.now(),
      },
    },
  };
  await saveProgress(updated);
  return updated;
}

export async function markKebTopicStarted(progress, topicId) {
  if (progress.kebTopics?.[topicId]?.lessonsStarted) return progress;
  const updated = {
    ...progress,
    kebTopics: {
      ...(progress.kebTopics || {}),
      [topicId]: {
        ...(progress.kebTopics?.[topicId] || {}),
        lessonsStarted: true,
      },
    },
  };
  await saveProgress(updated);
  return updated;
}

// ─── Level Track Progress ────────────────────────────────────

export async function markLevelLessonDone(progress, levelId, lessonId, xpGain) {
  const levels = progress?.levels || {};
  const lp = levels[levelId] || { xp: 0, lessonsCompleted: [], interviewCompleted: false, gateScore: null, gatePassed: false };
  if (lp.lessonsCompleted.includes(lessonId)) return progress;
  const newXP = (lp.xp || 0) + (xpGain || 0);
  const updated = {
    ...progress,
    totalXP: (progress?.totalXP || 0) + (xpGain || 0),
    levels: {
      ...levels,
      [levelId]: {
        ...lp,
        xp: newXP,
        lessonsCompleted: [...lp.lessonsCompleted, lessonId],
      },
    },
  };
  await saveProgress(updated);
  return updated;
}

export async function markLevelInterviewDone(progress, levelId) {
  const levels = progress?.levels || {};
  const lp = levels[levelId] || { xp: 0, lessonsCompleted: [], interviewCompleted: false, gateScore: null, gatePassed: false };
  const xpGain = 100;
  const updated = {
    ...progress,
    totalXP: (progress?.totalXP || 0) + (lp.interviewCompleted ? 0 : xpGain),
    levels: {
      ...levels,
      [levelId]: { ...lp, interviewCompleted: true, xp: lp.xp + (lp.interviewCompleted ? 0 : xpGain) },
    },
  };
  await saveProgress(updated);
  return updated;
}

export async function saveLevelGateResult(progress, levelId, score, passed) {
  const levels = progress?.levels || {};
  const lp = levels[levelId] || { xp: 0, lessonsCompleted: [], interviewCompleted: false, gateScore: null, gatePassed: false };
  const xpGain = passed && !lp.gatePassed ? 150 : 0;
  const updated = {
    ...progress,
    totalXP: (progress?.totalXP || 0) + xpGain,
    levels: {
      ...levels,
      [levelId]: { ...lp, gateScore: score, gatePassed: passed, xp: lp.xp + xpGain },
    },
  };
  await saveProgress(updated);
  return updated;
}
