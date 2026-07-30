import React, { useState } from 'react';
import {
  FileText,
  FolderOpen,
  Plus,
  Download,
  Moon,
  Sun,
  Code,
  Sparkles,
  Search,
  BookOpen,
  ChevronDown,
  HelpCircle,
  History,
} from 'lucide-react';
import { EditorSettings } from '../types';

interface TitleBarProps {
  currentFileName?: string;
  settings: EditorSettings;
  onUpdateSettings: (newSettings: Partial<EditorSettings>) => void;
  onNewFile: () => void;
  onOpenFile: () => void;
  onOpenFolder: () => void;
  onSaveFile: () => void;
  onExportElectron: () => void;
  onOpenPromptFill: () => void;
  hasVariables: boolean;
  activeTab: 'files' | 'prompts' | 'toc';
  setActiveTab: (tab: 'files' | 'prompts' | 'toc') => void;
  onOpenCommandPalette?: () => void;
  onOpenPromptHub?: () => void;
  onOpenVersionHistory?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  currentFileName,
  settings,
  onUpdateSettings,
  onNewFile,
  onOpenFile,
  onOpenFolder,
  onSaveFile,
  onExportElectron,
  onOpenPromptFill,
  hasVariables,
  activeTab,
  setActiveTab,
  onOpenCommandPalette,
  onOpenPromptHub,
  onOpenVersionHistory,
}) => {
  const [activeMenu, setActiveMenu] = useState<'file' | 'view' | 'help' | null>(null);

  const toggleTheme = () => {
    onUpdateSettings({
      theme: settings.theme === 'dark' ? 'light' : 'dark',
    });
  };

  return (
    <header className="relative z-30 select-none bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-between px-3 py-1.5 min-h-[42px] shadow-xs">
      {/* Left: Menus & Title */}
      <div className="flex items-center gap-3">
        {/* Brand & App Title */}
        <div className="flex items-center gap-2 border-r border-zinc-200 dark:border-zinc-800 pr-3">
          <div className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-zinc-100 hidden sm:inline">
            MD Reader & Prompt Library
          </span>
        </div>

        {/* Navigation Dropdown Menu Items */}
        <div className="relative flex items-center text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              className={`px-2.5 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1 transition-colors cursor-pointer ${
                activeMenu === 'file' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : ''
              }`}
            >
              <span>File</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {activeMenu === 'file' && (
              <div
                className="absolute left-0 top-full mt-1 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-1 z-50 text-zinc-800 dark:text-zinc-200 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  onClick={() => {
                    onNewFile();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white flex items-center justify-between text-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5" /> New .md File
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Ctrl+N</span>
                </button>

                <button
                  onClick={() => {
                    onOpenFile();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white flex items-center justify-between text-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> Open .md File(s)
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Ctrl+O</span>
                </button>

                <button
                  onClick={() => {
                    onOpenFolder();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white flex items-center justify-between text-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FolderOpen className="w-3.5 h-3.5" /> Open Folder Library
                  </span>
                </button>

                <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />

                <button
                  onClick={() => {
                    onSaveFile();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white flex items-center justify-between text-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5" /> Save / Download .md
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Ctrl+S</span>
                </button>

                {onOpenVersionHistory && (
                  <button
                    onClick={() => {
                      onOpenVersionHistory();
                      setActiveMenu(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white flex items-center justify-between text-xs cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <History className="w-3.5 h-3.5" /> Revision History & Snapshots
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Tab Quick Toggles */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 ml-2">
            <button
              onClick={() => setActiveTab('files')}
              className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                activeTab === 'files'
                  ? 'bg-zinc-900 dark:bg-zinc-200 text-white dark:text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <FolderOpen className="w-3 h-3" />
              <span>Files</span>
            </button>

            <button
              onClick={() => setActiveTab('prompts')}
              className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                activeTab === 'prompts'
                  ? 'bg-zinc-900 dark:bg-zinc-200 text-white dark:text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Prompt Library</span>
            </button>
          </div>
        </div>
      </div>

      {/* Middle: Active File Name Banner & Quick Switcher */}
      <div className="hidden md:flex items-center gap-2 text-xs">
        <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-300 font-mono bg-zinc-100 dark:bg-zinc-950 px-3 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 max-w-xs truncate">
          <FileText className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
          <span className="truncate">{currentFileName || 'Untitled.md'}</span>
        </div>

        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer text-xs"
            title="Open Command Palette (Ctrl+K)"
          >
            <Search className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
            <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-950 px-1 py-0.2 rounded border border-zinc-200 dark:border-zinc-800">⌘K</span>
          </button>
        )}
      </div>

      {/* Right: Actions, Prompt Hub, Prompt Filler, Theme & Electron Exporter */}
      <div className="flex items-center gap-2">
        {/* Prompt Studio Hub Launch Button */}
        {onOpenPromptHub && (
          <button
            onClick={onOpenPromptHub}
            className="px-2.5 py-1 rounded-md bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white dark:text-zinc-100 border border-zinc-800 dark:border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Browse Prompt Studio & Templates Hub"
          >
            <Sparkles className="w-3.5 h-3.5 text-white dark:text-zinc-100" />
            <span className="hidden sm:inline">Prompt Studio</span>
          </button>
        )}

        {/* Dynamic Prompt Fill Button if variables detected */}
        {hasVariables && (
          <button
            onClick={onOpenPromptFill}
            className="px-2.5 py-1 rounded-md bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Prompt Variables Detected - Click to Fill"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white dark:fill-zinc-950" />
            <span>Fill Vars</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
          title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-zinc-200" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-zinc-800" />
          )}
        </button>
      </div>
    </header>
  );
};
