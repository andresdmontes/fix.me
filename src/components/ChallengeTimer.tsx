import React from 'react';
import { Play, Pause, Clock } from 'lucide-react';
import { formatTime } from '../utils/scoring';

interface ChallengeTimerProps {
  elapsedSeconds: number;
  isRunning: boolean;
  onToggleTimer: () => void;
}

export const ChallengeTimer: React.FC<ChallengeTimerProps> = ({
  elapsedSeconds,
  isRunning,
  onToggleTimer,
}) => {
  const timePenalty = Math.floor(elapsedSeconds / 30);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
      <div className="flex items-center gap-1.5 text-slate-300">
        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="font-mono text-sm font-semibold tabular-nums tracking-wide text-white">
          {formatTime(elapsedSeconds)}
        </span>
      </div>

      <button
        onClick={onToggleTimer}
        type="button"
        title={isRunning ? 'Pause timer' : 'Resume timer'}
        className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
      >
        {isRunning ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
      </button>

      {timePenalty > 0 && (
        <span className="text-[11px] font-mono text-rose-400/90 tabular-nums" title="-1 point every 30 seconds">
          -{timePenalty}pt
        </span>
      )}
    </div>
  );
};
