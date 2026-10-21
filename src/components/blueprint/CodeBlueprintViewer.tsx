import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  Layers, 
  Server, 
  Cpu, 
  Sparkles, 
  BookOpen, 
  ExternalLink 
} from 'lucide-react';
import { CODE_SNIPPETS, CodeSnippet } from '../../data/code-snippets';

export const CodeBlueprintViewer: React.FC = () => {
  const [activeSnippetId, setActiveSnippetId] = useState<string>(CODE_SNIPPETS[0].id);
  const [copied, setCopied] = useState<boolean>(false);

  const currentSnippet = CODE_SNIPPETS.find((s) => s.id === activeSnippetId) || CODE_SNIPPETS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentSnippet.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentSnippet.filename.split('/').pop() || 'code.php';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              BLUEPRINT ARSITEKTUR
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Arsitektur & Source Code Laravel 11 / Filament v3
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kumpulan kode produksi lengkap: Migration A-F, Nilai 6 Semester, Spatie Browsershot Queue Job, dan Backup Action
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-sm transition-all"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600">Tersalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Salin Kode File Ini</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Unduh File</span>
          </button>
        </div>
      </div>

      {/* Snippet Selection Tabs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {CODE_SNIPPETS.map((snippet) => {
          const isSelected = snippet.id === activeSnippetId;
          return (
            <button
              key={snippet.id}
              onClick={() => {
                setActiveSnippetId(snippet.id);
                setCopied(false);
              }}
              className={`p-3 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-950/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                <span className={isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}>
                  {snippet.category}
                </span>
                {isSelected && <span className="h-2 w-2 rounded-full bg-amber-500"></span>}
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {snippet.title}
              </h4>
              <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                {snippet.filename.split('/').pop()}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Snippet Overview & Explanation */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {currentSnippet.title}
            </h3>
            <span className="font-mono text-xs text-amber-600 dark:text-amber-400">
              Path: {currentSnippet.filename}
            </span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium self-start sm:self-center">
            {currentSnippet.code.split('\n').length} baris kode
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {currentSnippet.description}
        </p>

        {/* Explanation points */}
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Poin Penting Arsitektur & Kinerja:
          </h4>
          <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
            {currentSnippet.explanation.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">✔</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Code Display Container with Line Numbers */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 bg-slate-900/90 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/80"></span>
            <span className="h-3 w-3 rounded-full bg-amber-500/80"></span>
            <span className="h-3 w-3 rounded-full bg-emerald-500/80"></span>
            <span className="ml-2 font-mono text-[11px] text-slate-300">{currentSnippet.filename}</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">PHP 8.3 · Laravel 11 · Filament v3</span>
        </div>

        <div className="overflow-x-auto p-4 max-h-[600px] overflow-y-auto">
          <pre className="font-mono text-xs leading-relaxed text-slate-200">
            <code>{currentSnippet.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
