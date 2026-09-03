import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  parseDiagnosticAnswers,
  parseProgress,
  withExamScore,
  withKebTopicResult,
  withKebTopicStarted,
  withLessonCompleted,
  withLevelGateResult,
  withLevelInterviewCompleted,
  withLevelLessonCompleted,
} from './domain/progress';

const PROGRESS_KEY = 'fa-progress';
const DIAGNOSTIC_ANSWERS_KEY = 'fa-diagnostic-answers';

export async function loadProgress() {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const progress = parseProgress(raw);
    if (!progress) {
      await AsyncStorage.removeItem(PROGRESS_KEY);
      return {};
    }
    return progress;
  } catch {
    return {};
  }
}

export async function saveProgress(progress) {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export async function markLessonDone(progress, courseId, lessonId) {
  const updated = withLessonCompleted(progress, courseId, lessonId);
  await saveProgress(updated);
  return updated;
}

export async function saveExamScore(progress, courseId, score) {
  const updated = withExamScore(progress, courseId, score);
  await saveProgress(updated);
  return updated;
}

// ─── Диагностика ────────────────────────────────────────────

export async function saveDiagnosticAnswers(answers) {
  try {
    await AsyncStorage.setItem(DIAGNOSTIC_ANSWERS_KEY, JSON.stringify(answers));
    return true;
  } catch {
    return false;
  }
}

export async function loadDiagnosticAnswers() {
  try {
    const raw = await AsyncStorage.getItem(DIAGNOSTIC_ANSWERS_KEY);
    if (!raw) return [];
    return parseDiagnosticAnswers(raw) || [];
  } catch {
    return [];
  }
}

// ─── КЭБ прогресс ───────────────────────────────────────────

export async function saveKebTopicResult(progress, topicId, earned, maxScore, passed) {
  const updated = withKebTopicResult(progress, topicId, earned, maxScore, passed);
  await saveProgress(updated);
  return updated;
}

export async function markKebTopicStarted(progress, topicId) {
  const updated = withKebTopicStarted(progress, topicId);
  await saveProgress(updated);
  return updated;
}

// ─── Level Track Progress ────────────────────────────────────

export async function markLevelLessonDone(progress, levelId, lessonId, xpGain) {
  const updated = withLevelLessonCompleted(progress, levelId, lessonId, xpGain);
  await saveProgress(updated);
  return updated;
}

export async function markLevelInterviewDone(progress, levelId) {
  const updated = withLevelInterviewCompleted(progress, levelId);
  await saveProgress(updated);
  return updated;
}

export async function saveLevelGateResult(progress, levelId, score, passed) {
  const updated = withLevelGateResult(progress, levelId, score, passed);
  await saveProgress(updated);
  return updated;
}
