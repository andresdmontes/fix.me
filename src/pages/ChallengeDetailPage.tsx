import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Play,
  Send,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Code2,
} from 'lucide-react';
import { Challenge, ExecutionSummary, Language } from '../types/challenge';
import { CHALLENGES } from '../data/challenges';
import { evaluateCode, formatValue } from '../services/evaluator';
import { calculateScore, formatTime } from '../utils/scoring';
import { CodeEditor } from '../components/CodeEditor';
import { ChallengeTimer } from '../components/ChallengeTimer';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { TestResultsDrawer } from '../components/TestResultsDrawer';
import { VictoryModal } from '../components/VictoryModal';
import { DiffViewerModal } from '../components/DiffViewerModal';
import { useChallengeProgress } from '../hooks/useChallengeProgress';
import { soundManager } from '../utils/sound';

interface ChallengeDetailPageProps {
  challengeId: string;
  onBack: () => void;
  onNavigateToChallenge: (id: string) => void;
  progressHook: ReturnType<typeof useChallengeProgress>;
}

export const ChallengeDetailPage: React.FC<ChallengeDetailPageProps> = ({
  challengeId,
  onBack,
  onNavigateToChallenge,
  progressHook,
}) => {
  const challenge = CHALLENGES.find((c) => c.id === challengeId) || CHALLENGES[0];
  const { statsByChallengeId, recordSolve, saveDraft, getDraft } = progressHook;
  const existingStats = statsByChallengeId[challenge.id];

  // Code state: check for saved draft in localStorage, fallback to challenge buggy code
  const [code, setCode] = useState<string>(() => {
    return getDraft(challenge.id) || challenge.buggyCode;
  });

  // Whenever challengeId changes, re-sync code
  useEffect(() => {
    const saved = getDraft(challenge.id);
    setCode(saved || challenge.buggyCode);
    setElapsedSeconds(0);
    setFailedAttempts(0);
    setIsRunning(true);
    setTestSummary(null);
    setShowVictoryModal(false);
    setShowHint(false);
  }, [challenge.id]);

  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  // Attempt counter
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Test execution state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [testSummary, setTestSummary] = useState<ExecutionSummary | null>(null);

  // Modals & Panels
  const [showHint, setShowHint] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [isNewBestScore, setIsNewBestScore] = useState(false);
  const [isNewFastestTime, setIsNewFastestTime] = useState(false);
  const [solvedFinalScore, setSolvedFinalScore] = useState(100);

  // Active tab on left panel
  const [leftTab, setLeftTab] = useState<'problem' | 'testcases' | 'hint'>('problem');

  // Timer tick
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Auto-save code draft to localStorage
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    saveDraft(challenge.id, newCode);
  };

  // Reset code to original buggy code
  const handleResetCode = () => {
    if (window.confirm('Reset code back to original buggy code? Current edits will be lost.')) {
      setCode(challenge.buggyCode);
      saveDraft(challenge.id, challenge.buggyCode);
      setTestSummary(null);
    }
  };

  // Run Tests Handler (does not mark completed, but tracks failure attempts)
  const handleRunTests = async () => {
    soundManager.playRunClick();
    setIsEvaluating(true);
    try {
      const summary = await evaluateCode(code, challenge);
      setTestSummary(summary);

      if (!summary.allPassed) {
        setFailedAttempts((prev) => prev + 1);
        soundManager.playFailChime();
      } else {
        soundManager.playSuccessChime();
      }
    } catch (err: any) {
      setTestSummary({
        allPassed: false,
        totalTests: challenge.testCases.length,
        passedCount: 0,
        results: [],
        stdout: [],
        executionError: String(err.message || err),
        durationMs: 0,
      });
      setFailedAttempts((prev) => prev + 1);
      soundManager.playFailChime();
    } finally {
      setIsEvaluating(false);
    }
  };

  // Submit Solution Handler
  const handleSubmitSolution = async () => {
    soundManager.playRunClick();
    setIsEvaluating(true);
    try {
      const summary = await evaluateCode(code, challenge);
      setTestSummary(summary);

      if (summary.allPassed) {
        // Solved!
        setIsRunning(false);
        const { finalScore } = calculateScore(elapsedSeconds, failedAttempts);
        setSolvedFinalScore(finalScore);

        // Check records
        const newBest = !existingStats || finalScore > existingStats.bestScore;
        const newFastest =
          !existingStats || existingStats.fastestTimeSeconds <= 0 || elapsedSeconds < existingStats.fastestTimeSeconds;

        setIsNewBestScore(newBest);
        setIsNewFastestTime(newFastest);

        // Persist
        recordSolve(challenge.id, finalScore, elapsedSeconds, failedAttempts);
        setShowVictoryModal(true);
      } else {
        // Failed attempt penalty applies
        setFailedAttempts((prev) => prev + 1);
        soundManager.playFailChime();
      }
    } catch (err: any) {
      setTestSummary({
        allPassed: false,
        totalTests: challenge.testCases.length,
        passedCount: 0,
        results: [],
        stdout: [],
        executionError: String(err.message || err),
        durationMs: 0,
      });
      setFailedAttempts((prev) => prev + 1);
      soundManager.playFailChime();
    } finally {
      setIsEvaluating(false);
    }
  };

  // Keyboard shortcut: Ctrl+Enter / Cmd+Enter runs tests
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunTests();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, challenge, failedAttempts, elapsedSeconds]);

  // Find next challenge
  const currentIndex = CHALLENGES.findIndex((c) => c.id === challenge.id);
  const nextChallenge = currentIndex >= 0 && currentIndex < CHALLENGES.length - 1 ? CHALLENGES[currentIndex + 1] : null;
  const prevChallenge = currentIndex > 0 ? CHALLENGES[currentIndex - 1] : null;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Breadcrumb & Quick Challenge Switcher */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-950 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Challenges</span>
          </button>
          <span className="text-slate-700">/</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white truncate max-w-xs sm:max-w-md">
              {challenge.title}
            </span>
            <span
              className={`text-[11px] font-medium ${
                challenge.difficulty === 'Easy'
                  ? 'text-emerald-400'
                  : challenge.difficulty === 'Medium'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              ({challenge.difficulty})
            </span>
            {existingStats?.completed && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Solved (Best: {existingStats.bestScore}pts)</span>
              </span>
            )}
          </div>
        </div>

        {/* Quick Prev / Next Navigator */}
        <div className="flex items-center gap-1.5">
          <button
            disabled={!prevChallenge}
            onClick={() => prevChallenge && onNavigateToChallenge(prevChallenge.id)}
            title={prevChallenge ? `Previous: ${prevChallenge.title}` : 'First challenge'}
            className="p-1 rounded text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {currentIndex + 1} / {CHALLENGES.length}
          </span>
          <button
            disabled={!nextChallenge}
            onClick={() => nextChallenge && onNavigateToChallenge(nextChallenge.id)}
            title={nextChallenge ? `Next: ${nextChallenge.title}` : 'Last challenge'}
            className="p-1 rounded text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split Body: Left Description & Right Monaco Code Editor */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Panel: Problem, Test Cases, Clues */}
        <div className="lg:col-span-5 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/40 overflow-hidden">
          {/* Subtabs */}
          <div className="flex items-center px-4 py-2 border-b border-slate-800 bg-slate-950/60 text-xs">
            <button
              onClick={() => setLeftTab('problem')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                leftTab === 'problem' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Description &amp; Bug
            </button>
            <button
              onClick={() => setLeftTab('testcases')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                leftTab === 'testcases' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Test Specs ({challenge.testCases.length})
            </button>
            <button
              onClick={() => setLeftTab('hint')}
              className={`px-3 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
                leftTab === 'hint' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <span>Bug Clue</span>
            </button>

            {existingStats?.completed && (
              <button
                onClick={() => setShowDiffModal(true)}
                className="ml-auto text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-mono"
              >
                <span>Solution Diff</span>
              </button>
            )}
          </div>

          {/* Left Panel Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 text-sm text-slate-300">
            {leftTab === 'problem' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">{challenge.title}</h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>{challenge.category}</span>
                    <span>·</span>
                    <span>Function: <code className="text-amber-400 font-mono">{challenge.functionName}()</code></span>
                  </div>
                </div>

                <div className="prose prose-invert prose-sm max-w-none space-y-3 leading-relaxed">
                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-300">
                    {challenge.description}
                  </div>
                </div>

                {/* Bug Alert Callout */}
                <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200/90 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Your Mission</span>
                  </div>
                  <p className="leading-relaxed">
                    The provided snippet contains a logic bug. Modify the code in the editor to make all test cases pass without altering function names or required signatures.
                  </p>
                </div>
              </div>
            )}

            {leftTab === 'testcases' && (
              <div className="space-y-3 text-xs">
                <div className="text-slate-400 text-xs">
                  These test cases define the expected behavior. Edge cases, mutations, and boundaries are checked.
                </div>
                <div className="space-y-2.5">
                  {challenge.testCases.map((tc, idx) => (
                    <div key={tc.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
                      <div className="flex items-center justify-between font-sans">
                        <span className="font-semibold text-slate-200">
                          Case {idx + 1}: {tc.description}
                        </span>
                        {tc.hidden && (
                          <span className="text-[10px] text-slate-500 font-mono">(hidden in summary)</span>
                        )}
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div className="text-slate-400">
                          Input: <span className="text-slate-200">{formatValue(tc.input)}</span>
                        </div>
                        <div className="text-emerald-400">
                          Expected: <span>{tc.shouldThrow ? '[Should Throw Error]' : formatValue(tc.expected)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {leftTab === 'hint' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-semibold text-amber-400">
                  <Lightbulb className="w-4 h-4" />
                  <span>Targeted Bug Clue</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {challenge.bugClue}
                </p>
                <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
                  Note: Using this clue does not deduct extra points, but speed is penalized by 1 pt per 30 seconds.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Editor + Test Drawer + Control Footer */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-[#090d16]">
          {/* Editor Canvas */}
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              code={code}
              onChange={handleCodeChange}
              language={challenge.language}
              onReset={handleResetCode}
              minHeight="100%"
            />
          </div>

          {/* Test Results Output Drawer */}
          <div className="max-h-[320px] overflow-hidden shrink-0">
            <TestResultsDrawer summary={testSummary} isRunning={isEvaluating} />
          </div>

          {/* Bottom Execution & Metric Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-t border-slate-800 bg-slate-950 shrink-0">
            {/* Live Metrics: Timer & Score Breakdown */}
            <div className="flex items-center gap-2.5">
              <ChallengeTimer
                elapsedSeconds={elapsedSeconds}
                isRunning={isRunning}
                onToggleTimer={() => setIsRunning(!isRunning)}
              />
              <ScoreDisplay
                elapsedSeconds={elapsedSeconds}
                failedAttempts={failedAttempts}
              />
            </div>

            {/* Action Buttons: Run Tests & Submit */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunTests}
                disabled={isEvaluating}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50 border border-slate-700"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                <span>Run Tests</span>
              </button>

              <button
                onClick={handleSubmitSolution}
                disabled={isEvaluating}
                type="button"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors disabled:opacity-50 shadow-md shadow-amber-500/10"
              >
                <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Submit Solution</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={showVictoryModal}
        onClose={() => setShowVictoryModal(false)}
        onNextChallenge={
          nextChallenge
            ? () => {
                setShowVictoryModal(false);
                onNavigateToChallenge(nextChallenge.id);
              }
            : undefined
        }
        onReviewCode={() => {
          setShowVictoryModal(false);
          setShowDiffModal(true);
        }}
        challengeTitle={challenge.title}
        elapsedSeconds={elapsedSeconds}
        failedAttempts={failedAttempts}
        finalScore={solvedFinalScore}
        isNewBestScore={isNewBestScore}
        isNewFastestTime={isNewFastestTime}
      />

      {/* Diff Review Modal */}
      <DiffViewerModal
        isOpen={showDiffModal}
        onClose={() => setShowDiffModal(false)}
        originalCode={challenge.buggyCode}
        solutionCode={challenge.expectedSolution}
        title={challenge.title}
        bugExplanation={challenge.bugExplanation}
      />
    </div>
  );
};
