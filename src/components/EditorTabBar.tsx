import React from 'react';
import { X, Plus } from 'lucide-react';
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
    <div className="flex items-center h-9 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800/80 px-2 select-none shrink-0">
      <div className="flex items-center gap-0.5 flex-1 overflow-x-auto no-scrollbar h-full">
        {openFiles.map((file) => {
          const isActive = file.id === currentFileId;

          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className={`group relative flex items-center gap-2 px-3 h-7 rounded-md transition-colors cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium shadow-2xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50'
              }`}
            >
              <span className="truncate max-w-[160px] text-xs">{file.name}</span>

              {openFiles.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(file.id);
                  }}
                  className={`p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-opacity cursor-pointer ${
                    isActive ? 'opacity-60 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  title="Close tab"
                  aria-label={`Close ${file.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onNewFile}
        className="p-1.5 rounded-md hover:bg-zinc-200/70 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shrink-0 cursor-pointer ml-1"
        title="New file (Ctrl+N)"
        aria-label="Create new file"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
