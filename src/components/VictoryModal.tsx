import React, { useEffect } from 'react';
import { Trophy, Clock, CheckCircle2, RotateCw, ArrowRight, List, Star, ShieldCheck } from 'lucide-react';
import { formatTime, formatTimeText, calculateScore } from '../utils/scoring';
import { triggerConfetti } from '../utils/confetti';
import { soundManager } from '../utils/sound';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNextChallenge?: () => void;
  onReviewCode: () => void;
  challengeTitle: string;
  elapsedSeconds: number;
  failedAttempts: number;
  finalScore: number;
  isNewBestScore: boolean;
  isNewFastestTime: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onClose,
  onNextChallenge,
  onReviewCode,
  challengeTitle,
  elapsedSeconds,
  failedAttempts,
  finalScore,
  isNewBestScore,
  isNewFastestTime,
}) => {
  useEffect(() => {
    if (isOpen) {
      triggerConfetti();
      soundManager.playSuccessChime();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const breakdown = calculateScore(elapsedSeconds, failedAttempts);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-5">
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Challenge Solved!</h2>
            <p className="text-xs text-slate-400 mt-0.5">{challengeTitle}</p>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-center font-mono">
          <div className="p-2 rounded bg-slate-900/60">
            <div className="text-[11px] text-slate-400 font-sans mb-0.5">Final Score</div>
            <div className="text-xl font-bold text-amber-400 tabular-nums">{finalScore}</div>
            <div className="text-[10px] text-slate-500">out of 100</div>
          </div>

          <div className="p-2 rounded bg-slate-900/60">
            <div className="text-[11px] text-slate-400 font-sans mb-0.5">Total Time</div>
            <div className="text-xl font-bold text-emerald-400 tabular-nums">{formatTime(elapsedSeconds)}</div>
            <div className="text-[10px] text-slate-500">{formatTimeText(elapsedSeconds)}</div>
          </div>

          <div className="p-2 rounded bg-slate-900/60">
            <div className="text-[11px] text-slate-400 font-sans mb-0.5">Attempts</div>
            <div className="text-xl font-bold text-sky-400 tabular-nums">{failedAttempts + 1}</div>
            <div className="text-[10px] text-slate-500">{failedAttempts} failed</div>
          </div>
        </div>

        {/* Badges / Accomplishments */}
        {(isNewBestScore || isNewFastestTime) && (
          <div className="flex items-center justify-center gap-2 text-xs font-semibold">
            {isNewBestScore && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                <Star className="w-3.5 h-3.5" />
                <span>New Best Score!</span>
              </span>
            )}
            {isNewFastestTime && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                <Clock className="w-3.5 h-3.5" />
                <span>Fastest Completion!</span>
              </span>
            )}
          </div>
        )}

        {/* Score Breakdown Table */}
        <div className="space-y-1.5 p-3 rounded bg-slate-950/60 border border-slate-800/80 text-xs font-mono">
          <div className="text-[11px] font-sans font-semibold text-slate-300 mb-1">
            Score Calculation Breakdown
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Starting Base:</span>
            <span className="text-slate-100">+100</span>
          </div>
          <div className="flex items-center justify-between text-rose-400/90">
            <span>Failed Attempts Penalty ({failedAttempts} &times; 5):</span>
            <span>-{breakdown.attemptPenalty}</span>
          </div>
          <div className="flex items-center justify-between text-rose-400/90">
            <span>Time Penalty (-1 per 30s):</span>
            <span>-{breakdown.timePenalty}</span>
          </div>
          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between font-bold text-amber-400">
            <span>Earned Points:</span>
            <span>{finalScore} pts</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
          {onNextChallenge && (
            <button
              onClick={onNextChallenge}
              className="w-full sm:flex-1 py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
            >
              <span>Next Challenge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onReviewCode}
            className="w-full sm:flex-1 py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Review Diff</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2 px-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
