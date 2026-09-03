import { beforeEach, describe, expect, it, vi } from 'vitest';

const asyncStorage = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}));

vi.mock('@react-native-async-storage/async-storage', () => ({ default: asyncStorage }));

import {
  loadDiagnosticAnswers,
  loadProgress,
  markLevelLessonDone,
  saveDiagnosticAnswers,
  saveProgress,
} from './storage';

describe('progress storage adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    asyncStorage.getItem.mockResolvedValue(null);
    asyncStorage.setItem.mockResolvedValue(undefined);
    asyncStorage.removeItem.mockResolvedValue(undefined);
  });

  it('returns empty progress when no record exists or storage is unavailable', async () => {
    await expect(loadProgress()).resolves.toEqual({});
    asyncStorage.getItem.mockRejectedValue(new Error('device unavailable'));
    await expect(loadProgress()).resolves.toEqual({});
  });

  it('loads validated progress and removes corrupted values', async () => {
    asyncStorage.getItem.mockResolvedValueOnce('{"totalXP":20}');
    await expect(loadProgress()).resolves.toEqual({ totalXP: 20 });

    asyncStorage.getItem.mockResolvedValueOnce('{broken');
    await expect(loadProgress()).resolves.toEqual({});
    expect(asyncStorage.removeItem).toHaveBeenCalledWith('fa-progress');
  });

  it('reports persistence success without throwing device details', async () => {
    await expect(saveProgress({ totalXP: 10 })).resolves.toBe(true);
    expect(asyncStorage.setItem).toHaveBeenCalledWith('fa-progress', '{"totalXP":10}');

    asyncStorage.setItem.mockRejectedValue(new Error('disk full'));
    await expect(saveProgress({ totalXP: 20 })).resolves.toBe(false);
  });

  it('persists the same immutable lesson result returned to the UI', async () => {
    const result = await markLevelLessonDone({}, 1, 'lesson-1', 50);
    expect(result).toMatchObject({ totalXP: 50 });
    expect(asyncStorage.setItem).toHaveBeenCalledWith('fa-progress', JSON.stringify(result));
  });

  it('validates diagnostic storage and reports write failures', async () => {
    asyncStorage.getItem.mockResolvedValueOnce('[{"answer":1}]');
    await expect(loadDiagnosticAnswers()).resolves.toEqual([{ answer: 1 }]);
    asyncStorage.getItem.mockResolvedValueOnce('{}');
    await expect(loadDiagnosticAnswers()).resolves.toEqual([]);
    asyncStorage.getItem.mockRejectedValueOnce(new Error('unavailable'));
    await expect(loadDiagnosticAnswers()).resolves.toEqual([]);

    await expect(saveDiagnosticAnswers([1])).resolves.toBe(true);
    asyncStorage.setItem.mockRejectedValueOnce(new Error('unavailable'));
    await expect(saveDiagnosticAnswers([1])).resolves.toBe(false);
  });
});
