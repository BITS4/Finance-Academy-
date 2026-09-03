import { z } from 'zod';

const levelProgressSchema = z.object({
  xp: z.number().finite().nonnegative().default(0),
  lessonsCompleted: z.array(z.string()).default([]),
  interviewCompleted: z.boolean().default(false),
  gateScore: z.number().finite().nullable().default(null),
  gatePassed: z.boolean().default(false),
});

const kebTopicSchema = z.object({
  lessonsStarted: z.boolean().default(false),
  examPassed: z.boolean().optional(),
  examScore: z.number().finite().min(0).max(100).optional(),
  lastScore: z.number().finite().optional(),
  lastAttempt: z.number().int().nonnegative().optional(),
});

const courseProgressSchema = z.object({
  lessons: z.array(z.string()).default([]),
  examScore: z.number().finite().nullable().default(null),
});

const progressSchema = z.object({
  totalXP: z.number().finite().nonnegative().optional(),
  levels: z.record(z.string(), levelProgressSchema).optional(),
  kebTopics: z.record(z.string(), kebTopicSchema).optional(),
  courses: z.record(z.string(), courseProgressSchema).optional(),
});

export type LevelProgress = z.infer<typeof levelProgressSchema>;
export type KebTopicProgress = z.infer<typeof kebTopicSchema>;
export type CourseProgress = z.infer<typeof courseProgressSchema>;
export type Progress = z.infer<typeof progressSchema>;

export function parseProgress(serialized: string): Progress | null {
  try {
    const parsed: unknown = JSON.parse(serialized);
    const result = progressSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function parseDiagnosticAnswers(serialized: string): unknown[] | null {
  try {
    const parsed: unknown = JSON.parse(serialized);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function defaultLevelProgress(): LevelProgress {
  return {
    xp: 0,
    lessonsCompleted: [],
    interviewCompleted: false,
    gateScore: null,
    gatePassed: false,
  };
}

export function withLessonCompleted(
  progress: Progress,
  courseId: string,
  lessonId: string,
): Progress {
  const current = progress.courses?.[courseId] ?? { lessons: [], examScore: null };
  if (current.lessons.includes(lessonId)) return progress;
  return {
    ...progress,
    courses: {
      ...progress.courses,
      [courseId]: { ...current, lessons: [...current.lessons, lessonId] },
    },
  };
}

export function withExamScore(progress: Progress, courseId: string, score: number): Progress {
  const current = progress.courses?.[courseId] ?? { lessons: [], examScore: null };
  return {
    ...progress,
    courses: { ...progress.courses, [courseId]: { ...current, examScore: score } },
  };
}

export function withKebTopicResult(
  progress: Progress,
  topicId: string,
  earned: number,
  maxScore: number,
  passed: boolean,
  now = Date.now(),
): Progress {
  const percentage = maxScore > 0 ? Math.round((earned / maxScore) * 100) : 0;
  return {
    ...progress,
    kebTopics: {
      ...progress.kebTopics,
      [topicId]: {
        lessonsStarted: true,
        examPassed: passed,
        examScore: Math.max(0, Math.min(100, percentage)),
        lastScore: earned,
        lastAttempt: now,
      },
    },
  };
}

export function withKebTopicStarted(progress: Progress, topicId: string): Progress {
  const current = progress.kebTopics?.[topicId];
  if (current?.lessonsStarted) return progress;
  return {
    ...progress,
    kebTopics: {
      ...progress.kebTopics,
      [topicId]: { ...current, lessonsStarted: true },
    },
  };
}

export function withLevelLessonCompleted(
  progress: Progress,
  levelId: number,
  lessonId: string,
  xpGain: number,
): Progress {
  const levels = progress.levels ?? {};
  const current = levels[levelId] ?? defaultLevelProgress();
  if (current.lessonsCompleted.includes(lessonId)) return progress;
  const safeXp = Math.max(0, xpGain);
  return {
    ...progress,
    totalXP: (progress.totalXP ?? 0) + safeXp,
    levels: {
      ...levels,
      [levelId]: {
        ...current,
        xp: current.xp + safeXp,
        lessonsCompleted: [...current.lessonsCompleted, lessonId],
      },
    },
  };
}

export function withLevelInterviewCompleted(progress: Progress, levelId: number): Progress {
  const levels = progress.levels ?? {};
  const current = levels[levelId] ?? defaultLevelProgress();
  if (current.interviewCompleted) return progress;
  const xpGain = 100;
  return {
    ...progress,
    totalXP: (progress.totalXP ?? 0) + xpGain,
    levels: {
      ...levels,
      [levelId]: { ...current, interviewCompleted: true, xp: current.xp + xpGain },
    },
  };
}

export function withLevelGateResult(
  progress: Progress,
  levelId: number,
  score: number,
  passed: boolean,
): Progress {
  const levels = progress.levels ?? {};
  const current = levels[levelId] ?? defaultLevelProgress();
  const xpGain = passed && !current.gatePassed ? 150 : 0;
  return {
    ...progress,
    totalXP: (progress.totalXP ?? 0) + xpGain,
    levels: {
      ...levels,
      [levelId]: {
        ...current,
        gateScore: score,
        gatePassed: passed,
        xp: current.xp + xpGain,
      },
    },
  };
}
