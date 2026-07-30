import React, { useState, useEffect } from 'react';
import { Search, FileText, Sparkles, Moon, Sun, Layout, Eye, Plus, X, Command, Image as ImageIcon, Table as TableIcon } from 'lucide-react';
import { MDFile, ViewMode, EditorSettings } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  files: MDFile[];
  onSelectFile: (id: string) => void;
  onNewFile: () => void;
  onChangeViewMode: (mode: ViewMode) => void;
  settings: EditorSettings;
  onUpdateSettings: (newSettings: Partial<EditorSettings>) => void;
  onOpenPromptFill: () => void;
  onOpenPromptHub?: () => void;
  onOpenImageModal?: () => void;
  onOpenTableModal?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  files,
  onSelectFile,
  onNewFile,
  onChangeViewMode,
  settings,
  onUpdateSettings,
  onOpenPromptFill,
  onOpenPromptHub,
  onOpenImageModal,
  onOpenTableModal,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredFiles = files.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.content.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-zinc-800 dark:text-zinc-200 animate-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 gap-3">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files, prompt templates, or commands..."
            autoFocus
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-500 text-zinc-900 dark:text-zinc-100 font-mono"
          />
          <span className="text-[10px] bg-zinc-100 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 font-mono">
            ESC
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 custom-scrollbar space-y-3">
          {/* Files Section */}
          <div>
            <div className="px-3 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider font-mono">
              Documents & Prompts ({filteredFiles.length})
            </div>
            {filteredFiles.length > 0 ? (
              <div className="space-y-0.5 mt-1">
                {filteredFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => {
                      onSelectFile(file.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs transition-colors group cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {file.isPrompt ? (
                        <Sparkles className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 shrink-0" />
                      )}
                      <span className="truncate font-medium">{file.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(file.updatedAt).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2 text-xs text-zinc-500 italic">No matching files found.</div>
            )}
          </div>

          {/* Actions & View Modes */}
          <div>
            <div className="px-3 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider font-mono">
              Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              {onOpenPromptHub && (
                <button
                  onClick={() => {
                    onOpenPromptHub();
                    onClose();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-semibold transition-colors text-left cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                  <span>Open Prompt Studio Hub</span>
                </button>
              )}

              <button
                onClick={() => {
                  onNewFile();
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 transition-colors text-left cursor-pointer"
              >
                <Plus className="w-4 h-4 text-zinc-500 dark:text-zinc-300 shrink-0" />
                <span>New .md Document</span>
              </button>

              {onOpenImageModal && (
                <button
                  onClick={() => {
                    onOpenImageModal();
                    onClose();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 transition-colors text-left cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-300 shrink-0" />
                  <span>Insert Placeholder Image</span>
                </button>
              )}

              {onOpenTableModal && (
                <button
                  onClick={() => {
                    onOpenTableModal();
                    onClose();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 transition-colors text-left cursor-pointer"
                >
                  <TableIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-300 shrink-0" />
                  <span>Generate Markdown Table</span>
                </button>
              )}

              <button
                onClick={() => {
                  onOpenPromptFill();
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 transition-colors text-left cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-zinc-500 dark:text-zinc-300 shrink-0" />
                <span>Fill Prompt Variables</span>
              </button>

              <button
                onClick={() => {
                  onChangeViewMode('split');
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 transition-colors text-left cursor-pointer"
              >
                <Layout className="w-4 h-4 text-zinc-500 dark:text-zinc-300 shrink-0" />
                <span>Split View Mode</span>
              </button>

              <button
                onClick={() => {
                  onChangeViewMode('preview');
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 transition-colors text-left cursor-pointer"
              >
                <Eye className="w-4 h-4 text-zinc-500 dark:text-zinc-300 shrink-0" />
                <span>Preview Only Mode</span>
              </button>

              <button
                onClick={() => {
                  onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 transition-colors text-left col-span-2 cursor-pointer"
              >
                {settings.theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                ) : (
                  <Moon className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
                )}
                <span>Toggle {settings.theme === 'dark' ? 'Light' : 'Dark'} Theme</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <div className="flex items-center gap-1.5">
            <Command className="w-3.5 h-3.5 text-zinc-400" />
            <span>Markdown Studio Quick Switcher</span>
          </div>
          <span>Press Esc to exit</span>
        </div>
      </div>
    </div>
  );
};
