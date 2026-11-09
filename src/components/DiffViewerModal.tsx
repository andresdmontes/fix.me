import React, { useState } from 'react';
import { X, Check, Copy } from 'lucide-react';
import { DiffEditor } from '@monaco-editor/react';

interface DiffViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalCode: string; // The buggy or user code
  solutionCode: string; // The canonical solution
  title: string;
  bugExplanation?: string;
}

export const DiffViewerModal: React.FC<DiffViewerModalProps> = ({
  isOpen,
  onClose,
  originalCode,
  solutionCode,
  title,
  bugExplanation,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySolution = async () => {
    try {
      await navigator.clipboard.writeText(solutionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[85vh] flex flex-col rounded-xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Solution Review &amp; Code Diff</span>
              <span className="text-slate-500 font-normal">·</span>
              <span className="text-xs font-mono text-amber-400 font-normal">{title}</span>
            </h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Left: Buggy Code / Your Draft &nbsp;|&nbsp; Right: Canonical Solution
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySolution}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Solution'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bug Explanation Banner if available */}
        {bugExplanation && (
          <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-200/90 leading-relaxed font-sans">
            <strong className="font-semibold text-amber-300">Root Cause Explanation: </strong>
            {bugExplanation}
          </div>
        )}

        {/* Diff Monaco Viewport */}
        <div className="flex-1 w-full bg-[#090d16]">
          <DiffEditor
            original={originalCode}
            modified={solutionCode}
            language="javascript"
            theme="vs-dark"
            options={{
              readOnly: true,
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace",
              renderSideBySide: true,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              minimap: { enabled: false },
              lineNumbers: 'on',
              wordWrap: 'on',
            }}
          />
        </div>
      </div>
    </div>
  );
};
