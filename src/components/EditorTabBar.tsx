import React from 'react';
import { FileText, X, Plus, Sparkles } from 'lucide-react';
import { MDFile } from '../types';

interface EditorTabBarProps {
  openFileIds: string[];
  files: MDFile[];
  currentFileId: string;
  onSelectFile: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewFile: () => void;
}

export const EditorTabBar: React.FC<EditorTabBarProps> = ({
  openFileIds,
  files,
  currentFileId,
  onSelectFile,
  onCloseTab,
  onNewFile,
}) => {
  const openFiles = openFileIds
    ? openFileIds
        .map((id) => files.find((f) => f.id === id))
        .filter((f): f is MDFile => Boolean(f))
    : [];

  if (openFiles.length === 0) return null;

  return (
    <div className="flex items-center bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-2 overflow-x-auto custom-scrollbar select-none text-xs gap-1 py-1">
      <div className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
        {openFiles.map((file) => {
          const isActive = file.id === currentFileId;
          const isPrompt = file.isPrompt || file.tags?.includes('prompt');

          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-t-md transition-all cursor-pointer border-t-2 ${
                isActive
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-zinc-900 dark:border-white font-medium shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {isPrompt ? (
                <Sparkles className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-200 shrink-0" />
              ) : (
                <FileText
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-400'
                  }`}
                />
              )}

              <span className="truncate max-w-[140px] text-xs tracking-tight">{file.name}</span>

              {/* Close Tab Button */}
              {openFiles.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(file.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 text-zinc-400 dark:text-zinc-500 transition-opacity cursor-pointer"
                  title="Close Tab"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* New File Tab Button */}
      <button
        type="button"
        onClick={onNewFile}
        className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors shrink-0 cursor-pointer"
        title="New File (Ctrl+N)"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
