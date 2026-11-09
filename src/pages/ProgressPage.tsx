import React, { useState } from 'react';
import {
  Trophy,
  Clock,
  Award,
  CheckCircle2,
  RotateCcw,
  Download,
  AlertTriangle,
  ArrowRight,
  Flame,
  BarChart3,
  Check,
} from 'lucide-react';
import { CHALLENGES } from '../data/challenges';
import { formatTimeText, formatTime } from '../utils/scoring';
import { useChallengeProgress } from '../hooks/useChallengeProgress';

interface ProgressPageProps {
  progressHook: ReturnType<typeof useChallengeProgress>;
  onSelectChallenge: (challengeId: string) => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  progressHook,
  onSelectChallenge,
}) => {
  const {
    statsByChallengeId,
    totalChallenges,
    completedCount,
    completionPercentage,
    totalScore,
    avgTimeSeconds,
    difficultyStats,
    resetAllProgress,
  } = progressHook;

  const [showResetModal, setShowResetModal] = useState(false);
  const [exported, setExported] = useState(false);

  // Collect all history items sorted by timestamp desc
  const allHistory = Object.values(statsByChallengeId)
    .flatMap((stat) => {
      const challenge = CHALLENGES.find((c) => c.id === stat.challengeId);
      return (stat.history || []).map((h) => ({
        ...h,
        challengeTitle: challenge?.title || stat.challengeId,
        challengeDifficulty: challenge?.difficulty || 'Medium',
        challengeId: stat.challengeId,
      }));
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(statsByChallengeId, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bughunt-progress-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const handleConfirmReset = () => {
    resetAllProgress();
    setShowResetModal(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Progress &amp; Score Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your debugging efficiency, personal best scores, and completion records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportJSON}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
          >
            {exported ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
            <span>{exported ? 'Exported' : 'Export Stats'}</span>
          </button>

          <button
            onClick={() => setShowResetModal(true)}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 text-xs font-medium border border-rose-900/50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Completed Challenges</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums mt-1">
            {completedCount} <span className="text-xs font-sans text-slate-500 font-normal">/ {totalChallenges}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Points Earned</div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums mt-1">
            {totalScore} <span className="text-xs font-sans text-slate-500 font-normal">pts</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            {totalChallenges * 100} maximum possible
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Completion Rate</div>
          <div className="text-2xl font-bold font-mono text-sky-400 tabular-nums mt-1">
            {completionPercentage}%
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            {totalChallenges - completedCount} remaining
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Average Fastest Time</div>
          <div className="text-2xl font-bold font-mono text-purple-400 tabular-nums mt-1">
            {avgTimeSeconds > 0 ? formatTimeText(avgTimeSeconds) : '--'}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            Across solved challenges
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown Strip */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 font-sans">
          Difficulty Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['Easy', 'Medium', 'Hard'] as const).map((diff) => {
            const count = difficultyStats[diff].completed;
            const total = difficultyStats[diff].total;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const color =
              diff === 'Easy'
                ? 'text-emerald-400 bg-emerald-500'
                : diff === 'Medium'
                ? 'text-amber-400 bg-amber-500'
                : 'text-rose-400 bg-rose-500';

            return (
              <div key={diff} className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{diff}</span>
                  <span className="font-mono tabular-nums text-slate-400">
                    {count} / {total} ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${color.split(' ')[1]}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Challenges Performance Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">
            Challenge Records &amp; Best Times
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {completedCount} of {totalChallenges} solved
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-medium">
                <tr>
                  <th className="py-3 px-4">Challenge</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Best Score</th>
                  <th className="py-3 px-4 text-right">Fastest Time</th>
                  <th className="py-3 px-4 text-right">Attempts</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {CHALLENGES.map((challenge) => {
                  const stats = statsByChallengeId[challenge.id];
                  const isSolved = stats?.completed;

                  return (
                    <tr
                      key={challenge.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-sans font-medium text-slate-200">
                        {challenge.title}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`${
                            challenge.difficulty === 'Easy'
                              ? 'text-emerald-400'
                              : challenge.difficulty === 'Medium'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {challenge.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        {isSolved ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Solved</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">Unsolved</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums">
                        {stats && stats.completed ? (
                          <span className="text-amber-400 font-bold">{stats.bestScore} pts</span>
                        ) : (
                          <span className="text-slate-600">--</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums">
                        {stats && stats.completed ? (
                          <span className="text-slate-200">{formatTime(stats.fastestTimeSeconds)}</span>
                        ) : (
                          <span className="text-slate-600">--</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-400">
                        {stats ? stats.totalAttempts : 0}
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          onClick={() => onSelectChallenge(challenge.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold transition-all inline-flex items-center gap-1"
                        >
                          <span>{isSolved ? 'Replay' : 'Solve'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Submissions History Log */}
      {allHistory.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white tracking-tight">Recent Solve History</h2>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            {allHistory.slice(0, 10).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-2 border-b border-slate-800/60 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-200">{item.challengeTitle}</span>
                    <span className="text-slate-500 ml-2 font-mono text-[11px]">
                      {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 font-mono text-xs">
                  <span className="text-amber-400 font-bold tabular-nums">{item.score} pts</span>
                  <span className="text-slate-400 tabular-nums">{formatTime(item.timeSeconds)}</span>
                  <span className="text-slate-500 tabular-nums">att: {item.attempts}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center gap-2.5 text-rose-400 font-semibold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Reset All Progress?</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              This will permanently delete your completed challenges, best scores, fastest times, and saved code drafts from localStorage.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
