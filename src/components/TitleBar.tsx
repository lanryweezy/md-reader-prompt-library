import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  FolderOpen,
  Plus,
  Download,
  Moon,
  Sun,
  Search,
  ChevronDown,
  History,
  Save,
  RotateCcw,
  PanelLeft,
  Maximize2,
  Printer,
  CopyPlus,
  Sparkles,
  Laptop,
  FileCheck2,
} from 'lucide-react';
import { AutoSaveBackup, EditorSettings, ViewMode } from '../types';
import { formatAutoSaveTime } from '../utils/autoSave';

interface TitleBarProps {
  settings: EditorSettings;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onUpdateSettings: (newSettings: Partial<EditorSettings>) => void;
  onNewFile: () => void;
  onOpenFile: () => void;
  onOpenFolder: () => void;
  onSaveFile: () => void;
  onDuplicateFile: () => void;
  onPrint: () => void;
  onOpenPromptFill: () => void;
  variableCount: number;
  onOpenCommandPalette: () => void;
  onOpenVersionHistory: () => void;
  lastAutoSave?: AutoSaveBackup | null;
  hasRecoverableAutoSave?: boolean;
  onSaveBackupNow?: () => void;
  onRestoreAutoSave?: () => void;
  onGoHome?: () => void;
  onOpenDesktopModal?: () => void;
  onSetDefaultMdApp?: () => void;
  isElectron?: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  settings,
  viewMode,
  onChangeViewMode,
  isSidebarOpen,
  onToggleSidebar,
  onUpdateSettings,
  onNewFile,
  onOpenFile,
  onOpenFolder,
  onSaveFile,
  onDuplicateFile,
  onPrint,
  onOpenPromptFill,
  variableCount,
  onOpenCommandPalette,
  onOpenVersionHistory,
  lastAutoSave,
  hasRecoverableAutoSave,
  onSaveBackupNow,
  onRestoreAutoSave,
  onGoHome,
  onOpenDesktopModal,
  onSetDefaultMdApp,
  isElectron,
}) => {
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsFileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFileMenuOpen]);

  const toggleTheme = () => {
    onUpdateSettings({
      theme: settings.theme === 'dark' ? 'light' : 'dark',
    });
  };

  return (
    <header className="relative z-30 h-11 select-none bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center justify-between gap-4 px-3 shrink-0">
      {/* Zone 1: Sidebar Toggle, Brand & File Menu */}
      <div className="flex items-center gap-2 shrink-0">
        {viewMode !== 'focus' && (
          <button
            onClick={onToggleSidebar}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              isSidebarOpen
                ? 'text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
            title={isSidebarOpen ? 'Hide sidebar (Ctrl+\\)' : 'Show sidebar (Ctrl+\\)'}
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        {onGoHome && !isElectron ? (
          <button
            onClick={onGoHome}
            className="font-display font-semibold text-[13px] tracking-tight text-zinc-900 dark:text-zinc-100 hover:opacity-75 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
            title="Back to Landing Page & Desktop Downloads"
          >
            MD Reader
          </button>
        ) : (
          <span className="font-display font-semibold text-[13px] tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap shrink-0">
            MD Reader
          </span>
        )}

        <div className="w-px h-3.5 bg-zinc-200 dark:bg-zinc-800 mx-1" aria-hidden="true" />

        {/* File Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsFileMenuOpen((open) => !open)}
            className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
              isFileMenuOpen
                ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <span>File</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {isFileMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg py-1 z-50 text-zinc-800 dark:text-zinc-200">
              <button
                onClick={() => {
                  onNewFile();
                  setIsFileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-zinc-500" /> New File
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Ctrl+N</span>
              </button>

              <button
                onClick={() => {
                  onOpenFile();
                  setIsFileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-zinc-500" /> Import Files
                </span>
              </button>

              <button
                onClick={() => {
                  onOpenFolder();
                  setIsFileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FolderOpen className="w-3.5 h-3.5 text-zinc-500" /> Open Folder
                </span>
              </button>

              <button
                onClick={() => {
                  onDuplicateFile();
                  setIsFileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <CopyPlus className="w-3.5 h-3.5 text-zinc-500" /> Duplicate File
                </span>
              </button>

              <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />

              <button
                onClick={() => {
                  onSaveFile();
                  setIsFileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-zinc-500" />{' '}
                  {isElectron ? 'Save to Disk' : 'Download .md'}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Ctrl+S</span>
              </button>

              <button
                onClick={() => {
                  onPrint();
                  setIsFileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Printer className="w-3.5 h-3.5 text-zinc-500" /> Print / Export PDF
                </span>
              </button>

              <button
                onClick={() => {
                  onOpenVersionHistory();
                  setIsFileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-zinc-500" /> Revision History
                </span>
              </button>

              <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />

              <button
                onClick={() => onUpdateSettings({ autoSave: !settings.autoSave })}
                className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Save className="w-3.5 h-3.5 text-zinc-500" /> Auto-Save (30s)
                </span>
                <span
                  className={`text-[10px] font-mono font-semibold ${
                    settings.autoSave
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {settings.autoSave ? 'ON' : 'OFF'}
                </span>
              </button>

              {onSaveBackupNow && (
                <button
                  onClick={() => {
                    onSaveBackupNow();
                    setIsFileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Save className="w-3.5 h-3.5 text-zinc-400" /> Backup Copy Now
                  </span>
                </button>
              )}

              {hasRecoverableAutoSave && lastAutoSave && onRestoreAutoSave && (
                <button
                  onClick={() => {
                    onRestoreAutoSave();
                    setIsFileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Restore Auto-Save
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {formatAutoSaveTime(lastAutoSave.savedAt)}
                  </span>
                </button>
              )}

              {onSetDefaultMdApp && (
                <>
                  <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />
                  <button
                    onClick={() => {
                      onSetDefaultMdApp();
                      setIsFileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FileCheck2 className="w-3.5 h-3.5 text-zinc-500" /> Set as Default .md App
                    </span>
                  </button>
                </>
              )}

              {!isElectron && onOpenDesktopModal && (
                <button
                  onClick={() => {
                    onOpenDesktopModal();
                    setIsFileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Laptop className="w-3.5 h-3.5 text-zinc-500" /> Desktop App (.exe / .dmg / Linux)
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Zone 2: Clean View Mode Switcher */}
      <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg text-xs shrink-0">
        {(['edit', 'split', 'preview'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => onChangeViewMode(mode)}
            className={`px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer whitespace-nowrap ${
              viewMode === mode
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium shadow-2xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Zone 3: Contextual Primary Action + Subtle Utilities */}
      <div className="flex items-center gap-1.5 shrink-0">
        {variableCount > 0 && (
          <button
            onClick={onOpenPromptFill}
            className="px-2.5 py-1 rounded-md bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            title="Fill detected {{variables}} in this prompt template"
          >
            <Sparkles className="w-3 h-3" />
            <span>Fill {variableCount} {variableCount === 1 ? 'var' : 'vars'}</span>
          </button>
        )}

        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer text-xs whitespace-nowrap"
          title="Command Palette (Ctrl+K)"
          aria-label="Open command palette"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-mono text-[10px] opacity-75">⌘K</span>
        </button>

        <button
          onClick={() => onChangeViewMode(viewMode === 'focus' ? 'split' : 'focus')}
          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
            viewMode === 'focus'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
          title={viewMode === 'focus' ? 'Exit Focus Mode' : 'Focus Mode'}
          aria-label="Toggle focus mode"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle color theme"
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5" />
          ) : (
            <Moon className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </header>
  );
};
