import React, { useState } from 'react';
import { Play, RotateCcw, Sparkles, Terminal, Copy, Check } from 'lucide-react';
import { CodeEditor } from '../components/CodeEditor';
import { Language } from '../types/challenge';
import { formatValue } from '../services/evaluator';
import { soundManager } from '../utils/sound';

const INITIAL_PLAYGROUND_CODE = `// BugHunt Scratchpad & Sandbox
// Write, debug, or experiment with arbitrary JavaScript / TypeScript code!

function solve(nums) {
  console.log("Analyzing input array:", nums);
  
  // Try out an algorithm or debug snippet
  const evens = nums.filter(n => n % 2 === 0);
  const sum = evens.reduce((acc, val) => acc + val, 0);
  
  return {
    totalEvens: evens.length,
    sum: sum,
    average: evens.length > 0 ? sum / evens.length : 0
  };
}

// Return the result to see it in output panel
return solve([2, 5, 8, 11, 14, 17, 20]);
`;

export const PlaygroundPage: React.FC = () => {
  const [code, setCode] = useState<string>(INITIAL_PLAYGROUND_CODE);
  const [language, setLanguage] = useState<Language>('javascript');
  const [logs, setLogs] = useState<string[]>([]);
  const [output, setOutput] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRun = () => {
    soundManager.playRunClick();
    setIsExecuting(true);
    setLogs([]);
    setError(null);
    setOutput(null);

    const capturedLogs: string[] = [];
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;

    console.log = (...args) => {
      capturedLogs.push(args.map(formatValue).join(' '));
    };
    console.warn = (...args) => {
      capturedLogs.push('[warn] ' + args.map(formatValue).join(' '));
    };
    console.error = (...args) => {
      capturedLogs.push('[error] ' + args.map(formatValue).join(' '));
    };

    const startTime = performance.now();

    try {
      // Execute in function closure
      const fn = new Function(code);
      const res = fn();
      setOutput(res);
      setDuration(Math.round(performance.now() - startTime));
      soundManager.playSuccessChime();
    } catch (err: any) {
      setError(err.message || String(err));
      setDuration(Math.round(performance.now() - startTime));
      soundManager.playFailChime();
    } finally {
      console.log = origLog;
      console.warn = origWarn;
      console.error = origError;
      setLogs(capturedLogs);
      setIsExecuting(false);
    }
  };

  const handleReset = () => {
    setCode(INITIAL_PLAYGROUND_CODE);
    setLogs([]);
    setOutput(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Code Playground</h1>
          <p className="text-xs text-slate-400 mt-1">
            Freeform environment to test edge cases, prototype helper algorithms, and debug snippets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow-md shadow-amber-500/10"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Run Playground (Ctrl+Enter)</span>
          </button>
        </div>
      </div>

      {/* Editor & Console Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[650px]">
        {/* Monaco Editor */}
        <div className="lg:col-span-7 h-full">
          <CodeEditor
            code={code}
            onChange={setCode}
            language={language}
            onLanguageChange={setLanguage}
            onReset={handleReset}
            minHeight="100%"
          />
        </div>

        {/* Output & Console */}
        <div className="lg:col-span-5 flex flex-col h-full rounded-lg border border-slate-800 bg-[#070b13] overflow-hidden text-xs font-mono">
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 bg-slate-900/60 font-sans">
            <span className="font-semibold text-slate-300">Console &amp; Execution Output</span>
            {duration !== null && (
              <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                {duration}ms
              </span>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded bg-rose-950/40 border border-rose-900/60 text-rose-300 space-y-1">
                <div className="font-semibold text-rose-400 font-sans">Runtime Error:</div>
                <div className="text-[11px] whitespace-pre-wrap">{error}</div>
              </div>
            )}

            {/* Returned Value */}
            {output !== null && (
              <div className="space-y-1.5">
                <div className="text-slate-400 font-sans text-[11px] font-semibold">
                  Returned Value:
                </div>
                <pre className="p-3 rounded bg-slate-900/80 border border-slate-800 text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all text-xs">
                  {formatValue(output)}
                </pre>
              </div>
            )}

            {/* Standard Output Logs */}
            <div className="space-y-1.5">
              <div className="text-slate-400 font-sans text-[11px] font-semibold">
                Stdout Logs:
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800/80 min-h-[140px] space-y-1 text-slate-300">
                {logs.length === 0 ? (
                  <div className="text-slate-600 italic">No output yet. Click 'Run Playground' to execute.</div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      <span className="text-slate-600 mr-2">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
