import React from 'react';
import { Volume2, VolumeX, Sparkles, Terminal } from 'lucide-react';
import { soundManager } from '../utils/sound';

export type PageView = 'challenges' | 'challenge-detail' | 'progress' | 'playground';

interface HeaderProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  totalScore: number;
  completedCount: number;
  totalChallenges: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  totalScore,
  completedCount,
  totalChallenges,
}) => {
  const [soundOn, setSoundOn] = React.useState<boolean>(() => soundManager.isSoundEnabled());

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundManager.setSoundEnabled(next);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between gap-8 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('challenges')}
          className="flex items-center gap-2 text-left group transition-opacity hover:opacity-90 shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/10">
            <Terminal className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            BugHunt
          </span>
        </button>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onNavigate('challenges')}
            className={`whitespace-nowrap transition-colors pb-0.5 ${
              currentView === 'challenges' || currentView === 'challenge-detail'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Challenges
          </button>
          <button
            onClick={() => onNavigate('progress')}
            className={`whitespace-nowrap transition-colors pb-0.5 ${
              currentView === 'progress'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('playground')}
            className={`whitespace-nowrap transition-colors pb-0.5 ${
              currentView === 'playground'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Playground
          </button>
        </nav>

        {/* Zone 3: 1 primary action & compact status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-amber-400 font-bold tabular-nums">{totalScore}</span>
            <span className="text-slate-500">pts</span>
            <span className="text-slate-700">·</span>
            <span className="text-emerald-400 font-medium tabular-nums">{completedCount}/{totalChallenges}</span>
            <span className="text-slate-500">solved</span>
          </div>

          <button
            onClick={toggleSound}
            title={soundOn ? 'Mute sound effects' : 'Enable sound effects'}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
            aria-label="Toggle sound"
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
