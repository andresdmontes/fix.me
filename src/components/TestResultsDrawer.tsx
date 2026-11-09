import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertOctagon, Terminal, ChevronRight, ChevronDown, Check, EyeOff } from 'lucide-react';
import { ExecutionSummary, TestResult } from '../types/challenge';
import { formatValue } from '../services/evaluator';

interface TestResultsDrawerProps {
  summary: ExecutionSummary | null;
  isRunning: boolean;
}

export const TestResultsDrawer: React.FC<TestResultsDrawerProps> = ({
  summary,
  isRunning,
}) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'console'>('tests');
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<string | null>(null);

  if (isRunning) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-slate-400 gap-2 border-t border-slate-800 bg-[#070b13] min-h-[160px]">
        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono">Running test suite & evaluating edge cases...</span>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-4 flex items-center justify-between text-slate-500 text-xs font-mono border-t border-slate-800 bg-[#070b13]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-600" />
          <span>Click "Run Tests" or "Submit Solution" to verify your fix.</span>
        </div>
        <span className="text-slate-600">Shortcut: Ctrl + Enter</span>
      </div>
    );
  }

  const selectedResult =
    summary.results.find((r) => r.testCaseId === selectedTestCaseId) ||
    summary.results[0];

  return (
    <div className="flex flex-col border-t border-slate-800 bg-[#070b13] text-xs">
      {/* Top Status Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-3">
          {summary.executionError ? (
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <AlertOctagon className="w-4 h-4" />
              <span>Compilation / Runtime Error</span>
            </div>
          ) : summary.allPassed ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Accepted · All {summary.totalTests} Tests Passed</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <XCircle className="w-4 h-4" />
              <span>
                Wrong Answer · {summary.passedCount} / {summary.totalTests} Passed
              </span>
            </div>
          )}

          <span className="text-slate-600">·</span>
          <span className="font-mono text-slate-400 tabular-nums">
            Runtime: {summary.durationMs}ms
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeTab === 'tests'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Test Cases ({summary.passedCount}/{summary.totalTests})
          </button>
          <button
            onClick={() => setActiveTab('console')}
            className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'console'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3 h-3" />
            <span>Stdout Logs {summary.stdout.length > 0 && `(${summary.stdout.length})`}</span>
          </button>
        </div>
      </div>

      {/* Execution Error Banner if any */}
      {summary.executionError && (
        <div className="p-3 bg-rose-950/30 border-b border-rose-900/40 text-rose-300 font-mono whitespace-pre-wrap">
          {summary.executionError}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'tests' && summary.results.length > 0 && (
        <div className="flex flex-col md:flex-row min-h-[170px] max-h-[300px]">
          {/* Test Case Selector list */}
          <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-slate-800/80 p-2 overflow-y-auto space-y-1 shrink-0 bg-slate-950/40">
            {summary.results.map((r, idx) => (
              <button
                key={r.testCaseId}
                onClick={() => setSelectedTestCaseId(r.testCaseId)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors font-mono ${
                  (selectedTestCaseId || summary.results[0].testCaseId) === r.testCaseId
                    ? 'bg-slate-800 text-slate-100 font-semibold'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {r.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  )}
                  <span className="truncate">Case {idx + 1}</span>
                  {r.hidden && (
                    <span className="text-[10px] text-slate-500 font-sans">(hidden)</span>
                  )}
                </div>
                {r.executionTimeMs !== undefined && (
                  <span className="text-[10px] text-slate-500 tabular-nums">
                    {r.executionTimeMs}ms
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Test Case Detail View */}
          {selectedResult && (
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 font-sans">
                  {selectedResult.description}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    selectedResult.passed
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                      : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                  }`}
                >
                  {selectedResult.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>

              {/* Error Message if any */}
              {selectedResult.error && (
                <div className="p-2.5 rounded bg-rose-950/40 border border-rose-900/40 text-rose-300">
                  <div className="font-semibold text-rose-400 text-[11px] mb-1">Runtime Exception:</div>
                  <div className="text-[11px]">{selectedResult.error}</div>
                </div>
              )}

              {/* Expected vs Actual Diff */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] font-medium text-slate-400 mb-1 font-sans">Expected Output:</div>
                  <pre className="text-emerald-400 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                    {formatValue(selectedResult.expected)}
                  </pre>
                </div>

                <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] font-medium text-slate-400 mb-1 font-sans">Your Output:</div>
                  <pre
                    className={`text-xs overflow-x-auto whitespace-pre-wrap break-all ${
                      selectedResult.passed ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {selectedResult.error
                      ? `[Threw Error: ${selectedResult.error}]`
                      : formatValue(selectedResult.actual)}
                  </pre>
                </div>
              </div>

              {/* Test Case Specific Console Logs */}
              {selectedResult.logs && selectedResult.logs.length > 0 && (
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div className="text-[11px] font-medium text-slate-400 mb-1 font-sans">
                    Console Logs from this run:
                  </div>
                  <div className="space-y-0.5 text-slate-300 text-[11px]">
                    {selectedResult.logs.map((log, lIdx) => (
                      <div key={lIdx} className="text-slate-300">&gt; {log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Console Tab */}
      {activeTab === 'console' && (
        <div className="p-3.5 max-h-[250px] overflow-y-auto font-mono text-xs text-slate-300 space-y-1 bg-slate-950/60">
          {summary.stdout.length === 0 ? (
            <div className="text-slate-500 italic">No console logs emitted during execution. Add console.log() in your code to inspect variables.</div>
          ) : (
            summary.stdout.map((line, idx) => (
              <div key={idx} className="leading-relaxed">
                <span className="text-slate-600 select-none mr-2">&gt;</span>
                <span className="text-slate-200">{line}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
