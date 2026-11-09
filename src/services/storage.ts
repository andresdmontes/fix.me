import { UserProgress, ChallengeStats } from '../types/challenge';

const STORAGE_KEYS = {
  PROGRESS: 'bughunt_progress_v1',
  ACTIVE_SESSION: 'bughunt_active_session_v1',
  CODE_DRAFTS: 'bughunt_code_drafts_v1',
};

const DEFAULT_PROGRESS: UserProgress = {
  statsByChallengeId: {},
  activeDrafts: {},
};

export class StorageService {
  private static isAvailable(): boolean {
    try {
      const testKey = '__bughunt_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  static getProgress(): UserProgress {
    if (!this.isAvailable()) return DEFAULT_PROGRESS;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (!stored) return DEFAULT_PROGRESS;
      const parsed = JSON.parse(stored);
      return {
        statsByChallengeId: parsed.statsByChallengeId || {},
        lastActiveChallengeId: parsed.lastActiveChallengeId,
        activeDrafts: parsed.activeDrafts || {},
      };
    } catch (e) {
      console.warn('Failed to parse user progress from localStorage', e);
      return DEFAULT_PROGRESS;
    }
  }

  static saveProgress(progress: UserProgress): void {
    if (!this.isAvailable()) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to write progress to localStorage', e);
    }
  }

  static recordChallengeResult(
    challengeId: string,
    score: number,
    timeSeconds: number,
    attempts: number
  ): ChallengeStats {
    const progress = this.getProgress();
    const existing = progress.statsByChallengeId[challengeId];

    const now = Date.now();
    const newHistoryEntry = {
      timestamp: now,
      score,
      timeSeconds,
      attempts,
    };

    let updatedStats: ChallengeStats;

    if (!existing) {
      updatedStats = {
        challengeId,
        completed: true,
        bestScore: score,
        fastestTimeSeconds: timeSeconds,
        totalAttempts: attempts,
        lastCompletedAt: now,
        history: [newHistoryEntry],
      };
    } else {
      updatedStats = {
        ...existing,
        completed: true,
        bestScore: Math.max(existing.bestScore, score),
        fastestTimeSeconds:
          existing.fastestTimeSeconds > 0
            ? Math.min(existing.fastestTimeSeconds, timeSeconds)
            : timeSeconds,
        totalAttempts: existing.totalAttempts + attempts,
        lastCompletedAt: now,
        history: [newHistoryEntry, ...(existing.history || [])].slice(0, 50),
      };
    }

    progress.statsByChallengeId[challengeId] = updatedStats;
    progress.lastActiveChallengeId = challengeId;
    this.saveProgress(progress);

    return updatedStats;
  }

  static getDraft(challengeId: string): string | null {
    if (!this.isAvailable()) return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.CODE_DRAFTS);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed[challengeId] || null;
    } catch {
      return null;
    }
  }

  static saveDraft(challengeId: string, code: string): void {
    if (!this.isAvailable()) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.CODE_DRAFTS);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed[challengeId] = code;
      window.localStorage.setItem(STORAGE_KEYS.CODE_DRAFTS, JSON.stringify(parsed));
    } catch (e) {
      console.warn('Failed to save draft to localStorage', e);
    }
  }

  static clearDraft(challengeId: string): void {
    if (!this.isAvailable()) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.CODE_DRAFTS);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      delete parsed[challengeId];
      window.localStorage.setItem(STORAGE_KEYS.CODE_DRAFTS, JSON.stringify(parsed));
    } catch {}
  }

  static setLastActiveChallenge(challengeId: string): void {
    const progress = this.getProgress();
    progress.lastActiveChallengeId = challengeId;
    this.saveProgress(progress);
  }

  static resetAll(): void {
    if (!this.isAvailable()) return;
    try {
      window.localStorage.removeItem(STORAGE_KEYS.PROGRESS);
      window.localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      window.localStorage.removeItem(STORAGE_KEYS.CODE_DRAFTS);
    } catch (e) {
      console.warn('Failed to clear localStorage', e);
    }
  }
}
