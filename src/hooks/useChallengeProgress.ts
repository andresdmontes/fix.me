import { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storage';
import { UserProgress, ChallengeStats } from '../types/challenge';
import { CHALLENGES } from '../data/challenges';

export function useChallengeProgress() {
  const [progress, setProgress] = useState<UserProgress>(() => StorageService.getProgress());

  // Reload progress when window gains focus or storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setProgress(StorageService.getProgress());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const recordSolve = useCallback(
    (challengeId: string, score: number, timeSeconds: number, attempts: number) => {
      const updated = StorageService.recordChallengeResult(challengeId, score, timeSeconds, attempts);
      setProgress(StorageService.getProgress());
      return updated;
    },
    []
  );

  const saveDraft = useCallback((challengeId: string, code: string) => {
    StorageService.saveDraft(challengeId, code);
  }, []);

  const getDraft = useCallback((challengeId: string) => {
    return StorageService.getDraft(challengeId);
  }, []);

  const resetAllProgress = useCallback(() => {
    StorageService.resetAll();
    setProgress(StorageService.getProgress());
  }, []);

  const totalChallenges = CHALLENGES.length;
  const completedStats = Object.values(progress.statsByChallengeId).filter(s => s.completed);
  const completedCount = completedStats.length;
  const completionPercentage = totalChallenges > 0 ? Math.round((completedCount / totalChallenges) * 100) : 0;
  
  const totalScore = completedStats.reduce((sum, s) => sum + (s.bestScore || 0), 0);
  const avgTimeSeconds =
    completedCount > 0
      ? Math.round(completedStats.reduce((sum, s) => sum + s.fastestTimeSeconds, 0) / completedCount)
      : 0;

  const difficultyStats = {
    Easy: { total: 0, completed: 0 },
    Medium: { total: 0, completed: 0 },
    Hard: { total: 0, completed: 0 },
  };

  for (const c of CHALLENGES) {
    if (difficultyStats[c.difficulty]) {
      difficultyStats[c.difficulty].total++;
      if (progress.statsByChallengeId[c.id]?.completed) {
        difficultyStats[c.difficulty].completed++;
      }
    }
  }

  return {
    progress,
    statsByChallengeId: progress.statsByChallengeId,
    totalChallenges,
    completedCount,
    completionPercentage,
    totalScore,
    avgTimeSeconds,
    difficultyStats,
    recordSolve,
    saveDraft,
    getDraft,
    resetAllProgress,
  };
}
