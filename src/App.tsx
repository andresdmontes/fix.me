/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header, PageView } from './components/Header';
import { ChallengeListPage } from './pages/ChallengeListPage';
import { ChallengeDetailPage } from './pages/ChallengeDetailPage';
import { ProgressPage } from './pages/ProgressPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { useChallengeProgress } from './hooks/useChallengeProgress';
import { CHALLENGES } from './data/challenges';

export default function App() {
  const progressHook = useChallengeProgress();
  const { totalScore, completedCount, totalChallenges, progress } = progressHook;

  // View navigation state
  const [currentView, setCurrentView] = useState<PageView>('challenges');
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(() => {
    return progress.lastActiveChallengeId || CHALLENGES[0].id;
  });

  const handleSelectChallenge = (id: string) => {
    setSelectedChallengeId(id);
    setCurrentView('challenge-detail');
  };

  const handleBackToChallenges = () => {
    setCurrentView('challenges');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-300">
      {/* Top Bar Navigation */}
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        totalScore={totalScore}
        completedCount={completedCount}
        totalChallenges={totalChallenges}
      />

      {/* Main Content Pages */}
      <main className="flex-1 flex flex-col">
        {currentView === 'challenges' && (
          <ChallengeListPage
            onSelectChallenge={handleSelectChallenge}
            progressHook={progressHook}
          />
        )}

        {currentView === 'challenge-detail' && (
          <ChallengeDetailPage
            challengeId={selectedChallengeId}
            onBack={handleBackToChallenges}
            onNavigateToChallenge={setSelectedChallengeId}
            progressHook={progressHook}
          />
        )}

        {currentView === 'progress' && (
          <ProgressPage
            progressHook={progressHook}
            onSelectChallenge={handleSelectChallenge}
          />
        )}

        {currentView === 'playground' && <PlaygroundPage />}
      </main>

      {/* Minimal Footer (clean, no telemetry or pseudo-metrics) */}
      {currentView !== 'challenge-detail' && (
        <footer className="w-full border-t border-slate-900/80 py-6 text-center text-xs text-slate-600">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>BugHunt · Frontend-Only Challenge Debugging Platform</span>
            <span>Static SPA · Ready for Cloudflare Pages / Vercel / Netlify</span>
          </div>
        </footer>
      )}
    </div>
  );
}
