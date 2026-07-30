import React from 'react';
import { FileText, Clock, Hash, CheckCircle2, ZoomIn, ZoomOut, BookOpenCheck } from 'lucide-react';
import { EditorSettings, ViewMode } from '../types';
import { getDocumentStats } from '../utils/markdownParser';

interface StatusBarProps {
  content: string;
  filePath?: string;
  viewMode: ViewMode;
  settings: EditorSettings;
  onUpdateSettings: (newSettings: Partial<EditorSettings>) => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  content,
  filePath,
  viewMode,
  settings,
  onUpdateSettings,
}) => {
  const stats = getDocumentStats(content);

  const zoomIn = () => {
    onUpdateSettings({ fontSize: Math.min(24, settings.fontSize + 1) });
  };

  const zoomOut = () => {
    onUpdateSettings({ fontSize: Math.max(12, settings.fontSize - 1) });
  };

  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 px-3 py-1 flex items-center justify-between select-none z-20 shrink-0">
      {/* Left: Path & Status */}
      <div className="flex items-center gap-3 truncate">
        <span className="flex items-center gap-1 text-zinc-800 dark:text-zinc-200 font-medium truncate">
          <FileText className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
          <span className="truncate">{filePath || 'Untitled.md'}</span>
        </span>

        <span className="hidden sm:flex items-center gap-1 text-zinc-700 dark:text-zinc-300 font-medium">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Saved</span>
        </span>
      </div>

      {/* Middle: Document Metrics */}
      <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1" title="Word Count">
          <Hash className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
          <span>{stats.words.toLocaleString()} words</span>
        </span>

        <span className="hidden md:flex items-center gap-1" title="Character Count">
          <span>{stats.chars.toLocaleString()} chars</span>
        </span>

        <span className="hidden lg:flex items-center gap-1" title="Lines">
          <span>{stats.lines} lines</span>
        </span>

        <span className="hidden sm:flex items-center gap-1" title="Estimated Reading & Speaking Time">
          <Clock className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
          <span>~{stats.readingTimeMinutes}m read</span>
          <span className="text-zinc-400 dark:text-zinc-600">/</span>
          <span>~{stats.speakingTimeMinutes}m speak</span>
        </span>

        {stats.words > 10 && (
          <span
            className="hidden xl:flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px]"
            title={`Readability Score: ${stats.readabilityScore}/100`}
          >
            <BookOpenCheck className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
            <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{stats.readabilityGrade}</span>
          </span>
        )}
      </div>

      {/* Right: View Mode & Font Size Zoom */}
      <div className="flex items-center gap-3">
        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
          <button
            onClick={zoomOut}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer p-0.5"
            title="Decrease Font Size"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="text-[10px] w-6 text-center text-zinc-900 dark:text-zinc-200 font-bold">{settings.fontSize}px</span>
          <button
            onClick={zoomIn}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer p-0.5"
            title="Increase Font Size"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
        </div>

        {/* View Mode Badge */}
        <span className="uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold border border-zinc-200 dark:border-zinc-700">
          {viewMode}
        </span>
      </div>
    </footer>
  );
};
