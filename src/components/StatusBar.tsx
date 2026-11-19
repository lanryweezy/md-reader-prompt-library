import React from 'react';
import { RotateCcw } from 'lucide-react';
import { AutoSaveBackup, EditorSettings } from '../types';
import { getDocumentStats } from '../utils/markdownParser';
import { formatAutoSaveTime } from '../utils/autoSave';

interface StatusBarProps {
  content: string;
  settings: EditorSettings;
  onUpdateSettings: (newSettings: Partial<EditorSettings>) => void;
  lastAutoSave?: AutoSaveBackup | null;
  justAutoSaved?: boolean;
  onRestoreAutoSave?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  content,
  settings,
  onUpdateSettings,
  lastAutoSave,
  justAutoSaved,
  onRestoreAutoSave,
}) => {
  const stats = getDocumentStats(content);
  const hasRecoverableBackup = Boolean(lastAutoSave && lastAutoSave.content !== content);

  return (
    <footer className="h-7 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800/80 text-[11px] text-zinc-500 dark:text-zinc-400 px-3 flex items-center justify-between select-none z-20 shrink-0">
      {/* Left: Quiet Auto-Save Status & Optional Restore */}
      <div className="flex items-center gap-3 truncate">
        <button
          onClick={() => onUpdateSettings({ autoSave: !settings.autoSave })}
          className={`transition-colors cursor-pointer whitespace-nowrap ${
            settings.autoSave
              ? justAutoSaved
                ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
          title={
            settings.autoSave
              ? lastAutoSave
                ? `Auto-save active (every 30s). Last localStorage backup at ${formatAutoSaveTime(lastAutoSave.savedAt)}. Click to pause.`
                : 'Auto-save active (saves backup copy to localStorage every 30s). Click to pause.'
              : 'Auto-save paused. Click to enable 30-second localStorage backups.'
          }
        >
          {settings.autoSave
            ? lastAutoSave
              ? `Auto-saved ${formatAutoSaveTime(lastAutoSave.savedAt)}`
              : 'Auto-save · 30s'
            : 'Auto-save paused'}
        </button>

        {hasRecoverableBackup && lastAutoSave && onRestoreAutoSave && (
          <button
            onClick={onRestoreAutoSave}
            className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white underline underline-offset-2 transition-colors cursor-pointer whitespace-nowrap"
            title={`Restore localStorage backup from ${formatAutoSaveTime(lastAutoSave.savedAt)} (${lastAutoSave.wordCount} words)`}
          >
            <RotateCcw className="w-2.5 h-2.5 shrink-0" />
            <span>Restore backup</span>
          </button>
        )}
      </div>

      {/* Right: Quiet Unboxed Document Metrics */}
      <div className="flex items-center gap-2 font-mono tabular-nums text-[11px] text-zinc-400 dark:text-zinc-500 shrink-0">
        <span>{stats.words.toLocaleString()} words</span>
        <span aria-hidden="true">·</span>
        <span>{stats.readingTimeMinutes} min read</span>
      </div>
    </footer>
  );
};
