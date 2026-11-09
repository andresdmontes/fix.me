import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { RotateCcw, Copy, Check, Sparkles } from 'lucide-react';
import { Language } from '../types/challenge';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  onReset: () => void;
  readOnly?: boolean;
  minHeight?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  onLanguageChange,
  onReset,
  readOnly = false,
  minHeight = '360px',
}) => {
  const editorRef = useRef<any>(null);
  const [copied, setCopied] = React.useState(false);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define subtle dark theme accents
    monaco.editor.defineTheme('bughunt-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'f59e0b' },
        { token: 'identifier', foreground: 'e2e8f0' },
        { token: 'string', foreground: '10b981' },
        { token: 'number', foreground: '38bdf8' },
        { token: 'delimiter', foreground: '94a3b8' },
      ],
      colors: {
        'editor.background': '#090d16',
        'editor.foreground': '#e2e8f0',
        'editorCursor.foreground': '#f59e0b',
        'editor.lineHighlightBackground': '#11182740',
        'editorLineNumber.foreground': '#334155',
        'editorLineNumber.activeForeground': '#94a3b8',
        'editorIndentGuide.background': '#1e293b40',
        'editorIndentGuide.activeBackground': '#33415580',
        'editor.selectionBackground': '#f59e0b25',
      },
    });

    monaco.editor.setTheme('bughunt-dark');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  // Map app language to monaco language
  const monacoLanguage = language === 'typescript' ? 'typescript' : language === 'javascript' ? 'javascript' : language;

  return (
    <div className="flex flex-col h-full w-full rounded-lg border border-slate-800 bg-[#090d16] overflow-hidden">
      {/* Editor sub-toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 bg-slate-900/60 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-mono text-slate-400 font-medium">Editor</span>
          <span className="text-slate-600">·</span>
          {onLanguageChange ? (
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/60 cursor-pointer"
            >
              <option value="javascript">JavaScript (ES2022)</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python (Preview)</option>
              <option value="rust">Rust (Preview)</option>
            </select>
          ) : (
            <span className="text-slate-400 capitalize">{language}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleFormat}
            type="button"
            className="flex items-center gap-1 px-2 py-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
            title="Format Code (Prettier / Monaco)"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Format</span>
          </button>

          <button
            onClick={handleCopy}
            type="button"
            className="flex items-center gap-1 px-2 py-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={onReset}
            type="button"
            className="flex items-center gap-1 px-2 py-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
            title="Reset code to original buggy state"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Code</span>
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 w-full min-h-[300px]" style={{ minHeight }}>
        <Editor
          height="100%"
          language={monacoLanguage}
          value={code}
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          loading={
            <div className="flex items-center justify-center h-full text-slate-500 text-xs font-mono">
              Initializing Monaco Editor environment...
            </div>
          }
          options={{
            readOnly,
            fontSize: 13.5,
            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace",
            fontLigatures: true,
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            suggestOnTriggerCharacters: true,
            formatOnPaste: true,
          }}
        />
      </div>
    </div>
  );
};
