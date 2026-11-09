import { ScoreBreakdown } from '../types/challenge';

/**
 * Calculates the score based on the project requirements:
 * - Start at 100 points
 * - -5 points per failed attempt
 * - -1 point every 30 seconds
 * - Minimum score = 0
 */
export function calculateScore(
  elapsedSeconds: number,
  failedAttempts: number
): ScoreBreakdown {
  const baseScore = 100;
  const attemptPenalty = Math.max(0, failedAttempts * 5);
  const timePenalty = Math.max(0, Math.floor(elapsedSeconds / 30));
  
  const rawScore = baseScore - attemptPenalty - timePenalty;
  const finalScore = Math.max(0, rawScore);

  return {
    baseScore,
    attemptPenalty,
    timePenalty,
    finalScore,
  };
}

/**
 * Formats seconds into MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const paddedMins = String(mins).padStart(2, '0');
  const paddedSecs = String(secs).padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }
  return `${paddedMins}:${paddedSecs}`;
}

/**
 * Formats seconds into human-readable text e.g. "1m 45s" or "45s"
 */
export function formatTimeText(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}
