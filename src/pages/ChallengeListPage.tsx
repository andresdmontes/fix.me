import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2, Clock, Award, ArrowRight, Zap, Filter, Flame } from 'lucide-react';
import { Challenge, Difficulty } from '../types/challenge';
import { CHALLENGES } from '../data/challenges';
import { formatTimeText } from '../utils/scoring';
import { useChallengeProgress } from '../hooks/useChallengeProgress';

interface ChallengeListPageProps {
  onSelectChallenge: (challengeId: string) => void;
  progressHook: ReturnType<typeof useChallengeProgress>;
}

export const ChallengeListPage: React.FC<ChallengeListPageProps> = ({
  onSelectChallenge,
  progressHook,
}) => {
  const { statsByChallengeId, completedCount, totalChallenges, totalScore, completionPercentage, avgTimeSeconds } = progressHook;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Solved' | 'Unsolved'>('All');

  const filteredChallenges = useMemo(() => {
    return CHALLENGES.filter((c) => {
      // Search filter
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === 'All' || c.difficulty === selectedDifficulty;

      // Status filter
      const isSolved = statsByChallengeId[c.id]?.completed;
      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Solved' && isSolved) ||
        (selectedStatus === 'Unsolved' && !isSolved);

      return matchesSearch && matchesDifficulty && matchesStatus;
    });
  }, [searchQuery, selectedDifficulty, selectedStatus, statsByChallengeId]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Hero & Aggregate KPI Strip */}
      <div className="space-y-6">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Debugging Challenge Arena
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Spot intentional logic errors, race the clock, and patch buggy production snippets.
            Earn points for speed and accuracy with zero backend required.
          </p>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-xs text-slate-400">Total Solved</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums mt-1">
              {completedCount} <span className="text-xs font-sans text-slate-500 font-normal">/ {totalChallenges}</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-xs text-slate-400">Total Score</div>
            <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums mt-1">
              {totalScore} <span className="text-xs font-sans text-slate-500 font-normal">pts</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1.5">Max 100 pts per challenge</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-xs text-slate-400">Completion Rate</div>
            <div className="text-2xl font-bold font-mono text-sky-400 tabular-nums mt-1">
              {completionPercentage}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1.5">Challenges mastered</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-xs text-slate-400">Avg Solve Speed</div>
            <div className="text-2xl font-bold font-mono text-purple-400 tabular-nums mt-1">
              {avgTimeSeconds > 0 ? formatTimeText(avgTimeSeconds) : '--'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1.5">Fastest completion average</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, algorithm, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/80 transition-colors"
          />
        </div>

        {/* Segmented Filter Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Difficulty Filter */}
          <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
                  selectedDifficulty === diff
                    ? 'bg-slate-800 text-amber-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            {(['All', 'Solved', 'Unsolved'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
                  selectedStatus === st
                    ? 'bg-slate-800 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Challenge List Grid */}
      <div className="space-y-3">
        {filteredChallenges.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
            <Filter className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-300">No matching challenges found</div>
            <div className="text-xs text-slate-500">
              Try adjusting your search query or relaxing your difficulty and status filters.
            </div>
          </div>
        ) : (
          filteredChallenges.map((challenge, index) => {
            const stats = statsByChallengeId[challenge.id];
            const isSolved = stats?.completed;

            return (
              <div
                key={challenge.id}
                onClick={() => onSelectChallenge(challenge.id)}
                className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                {/* Left: Challenge Title & Unboxed Metadata */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-500 tabular-nums">
                      {String(index + 1).padStart(2, '0')}.
                    </span>
                    <h3 className="text-base font-semibold text-slate-100 group-hover:text-amber-400 transition-colors truncate">
                      {challenge.title}
                    </h3>
                    {isSolved && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 shrink-0 font-medium font-mono">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Solved</span>
                      </span>
                    )}
                  </div>

                  {/* Clean unboxed metadata with typographic separators */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span
                      className={`font-medium ${
                        challenge.difficulty === 'Easy'
                          ? 'text-emerald-400'
                          : challenge.difficulty === 'Medium'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {challenge.difficulty}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span>{challenge.category}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span>JavaScript (ES2022)</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="font-mono tabular-nums">~{challenge.estimatedMinutes} min</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-slate-500">{challenge.tags.slice(0, 3).join(', ')}</span>
                  </div>
                </div>

                {/* Right: Personal Stats & CTA */}
                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                  {stats && stats.completed ? (
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <div className="text-[10px] text-slate-500 font-sans">Best Score</div>
                        <div className="text-amber-400 font-bold tabular-nums">
                          {stats.bestScore} pts
                        </div>
                      </div>
                      <div className="border-l border-slate-800 pl-4">
                        <div className="text-[10px] text-slate-500 font-sans">Fastest</div>
                        <div className="text-slate-300 font-semibold tabular-nums">
                          {formatTimeText(stats.fastestTimeSeconds)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 font-mono">Not yet solved</div>
                  )}

                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-200 text-xs font-semibold transition-all shrink-0"
                  >
                    <span>{isSolved ? 'Re-attempt' : 'Debug Challenge'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
