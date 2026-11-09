import React, { useState } from 'react';
import { Award, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { calculateScore } from '../utils/scoring';

interface ScoreDisplayProps {
  elapsedSeconds: number;
  failedAttempts: number;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  elapsedSeconds,
  failedAttempts,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const breakdown = calculateScore(elapsedSeconds, failedAttempts);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs cursor-pointer select-none group"
      >
        {/* Score pill */}
        <div className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-400 font-medium">Score:</span>
          <span
            className={`font-mono text-sm font-bold tabular-nums ${
              breakdown.finalScore >= 80
                ? 'text-emerald-400'
                : breakdown.finalScore >= 50
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {breakdown.finalScore}
          </span>
          <span className="text-slate-600 font-mono text-[11px]">/ 100</span>
        </div>

        {/* Attempts indicator */}
        <div className="flex items-center gap-1 pl-1.5 border-l border-slate-800 text-slate-400 font-mono text-xs">
          <span>Att:</span>
          <span className={`font-semibold tabular-nums ${failedAttempts > 0 ? 'text-amber-300' : 'text-slate-300'}`}>
            {failedAttempts}
          </span>
        </div>

        <Info className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors" />
      </div>

      {/* Breakdown Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-64 p-3 rounded-lg bg-slate-900 border border-slate-700/80 shadow-xl z-50 text-xs text-slate-300 pointer-events-none">
          <div className="font-semibold text-slate-100 mb-2 border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span>Score Calculation</span>
            <span className="font-mono text-amber-400 font-bold">{breakdown.finalScore} pts</span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-300">
              <span>Base Points:</span>
              <span className="text-slate-100">+100</span>
            </div>
            <div className="flex items-center justify-between text-rose-400/90">
              <span>Failed Attempts ({failedAttempts} &times; 5):</span>
              <span>-{breakdown.attemptPenalty}</span>
            </div>
            <div className="flex items-center justify-between text-rose-400/90">
              <span>Time Penalty (1pt / 30s):</span>
              <span>-{breakdown.timePenalty}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-slate-200 font-bold">
              <span>Current Score:</span>
              <span className="text-amber-400">{breakdown.finalScore}</span>
            </div>
          </div>

          <p className="mt-2 text-[10px] text-slate-500 leading-normal font-sans">
            Submit your solution before penalties reduce your points! Minimum score is 0.
          </p>
        </div>
      )}
    </div>
  );
};
