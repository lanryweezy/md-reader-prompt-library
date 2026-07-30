import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  Plus,
  Search,
  Star,
  Sparkles,
  Tag,
  Upload,
  Trash2,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { MDFile, MDFolder, TOCItem } from '../types';

interface SidebarProps {
  files: MDFile[];
  folders: MDFolder[];
  currentFileId?: string;
  activeTab: 'files' | 'prompts' | 'toc';
  toc: TOCItem[];
  onSelectFile: (fileId: string) => void;
  onNewFile: (folderId?: string) => void;
  onNewFolder: () => void;
  onDeleteFile: (fileId: string) => void;
  onToggleFavorite: (fileId: string) => void;
  onImportFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImportDirectory: () => void;
  onOpenPromptLibraryHub?: () => void;
  onNewPromptTemplate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  files,
  folders,
  currentFileId,
  activeTab,
  toc,
  onSelectFile,
  onNewFile,
  onNewFolder,
  onDeleteFile,
  onToggleFavorite,
  onImportFiles,
  onImportDirectory,
  onOpenPromptLibraryHub,
  onNewPromptTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'f-prompts': true,
    'f-coding': true,
    'f-writing': true,
    'f-productivity': true,
    'f-docs': true,
  });

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  // Collect all unique tags
  const allTags = Array.from(new Set(files.flatMap((f) => f.tags || [])));

  // Filter files
  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = !selectedTag || file.tags.includes(selectedTag);

    if (activeTab === 'prompts') {
      return (file.isPrompt || file.tags.includes('ai-prompt')) && matchesSearch && matchesTag;
    }

    return matchesSearch && matchesTag;
  });

  const favoriteFiles = files.filter((f) => f.isFavorite);

  return (
    <aside className="w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full select-none text-zinc-700 dark:text-zinc-300 text-xs shrink-0">
      {/* Search Bar */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'prompts' ? 'Search prompt library & tags...' : 'Search .md files & content...'
            }
            className="w-full pl-8 pr-7 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 cursor-pointer"
              title="Clear search"
            >
              <span className="text-xs font-bold font-mono">×</span>
            </button>
          )}
        </div>

        {/* Action Buttons: New File, Import, Open Folder */}
        <div className="flex items-center gap-1 mt-1">
          <button
            onClick={() => onNewFile()}
            className="flex-1 px-2 py-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 rounded-md font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
            title="Create New Markdown File"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New .md</span>
          </button>

          <label
            className="p-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-md cursor-pointer transition-colors"
            title="Import .md files from disk"
          >
            <Upload className="w-3.5 h-3.5" />
            <input
              type="file"
              accept=".md,.markdown,.txt"
              multiple
              onChange={onImportFiles}
              className="hidden"
            />
          </label>

          <button
            onClick={onImportDirectory}
            className="p-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-md cursor-pointer transition-colors"
            title="Open Directory / Folder Access"
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
        {/* TAB 1: FILES & FOLDERS */}
        {activeTab === 'files' && (
          <div className="space-y-3">
            {/* Favorites Section */}
            {favoriteFiles.length > 0 && !searchQuery && !selectedTag && (
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-2 py-1">
                  <Star className="w-3 h-3 fill-zinc-900 dark:fill-zinc-200 text-zinc-900 dark:text-zinc-200" />
                  <span>Pinned Favorites</span>
                </div>
                <div className="space-y-0.5 mt-1">
                  {favoriteFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => onSelectFile(file.id)}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                        currentFileId === file.id
                          ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium border border-zinc-300 dark:border-zinc-700'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(file.id);
                        }}
                        className="opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <Star className="w-3 h-3 fill-zinc-900 dark:fill-zinc-200 text-zinc-900 dark:text-zinc-200" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Folder Tree & Unfolder Files */}
            <div>
              <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <span>Explorer ({filteredFiles.length})</span>
                <button
                  onClick={onNewFolder}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                  title="New Folder"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Render Root Folders */}
              {folders
                .filter((f) => !f.parentId)
                .map((folder) => {
                  const isExpanded = !!expandedFolders[folder.id];
                  const folderFiles = filteredFiles.filter((f) => f.folderId === folder.id);
                  const subFolders = folders.filter((f) => f.parentId === folder.id);

                  return (
                    <div key={folder.id} className="mt-1 space-y-0.5">
                      <div
                        onClick={() => toggleFolder(folder.id)}
                        className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer text-zinc-800 dark:text-zinc-200 font-medium group"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                          )}
                          {isExpanded ? (
                            <FolderOpen className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                          ) : (
                            <Folder className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                          )}
                          <span className="truncate">{folder.name}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                          {folderFiles.length}
                        </span>
                      </div>

                      {/* Sub-items if expanded */}
                      {isExpanded && (
                        <div className="pl-4 border-l border-zinc-200 dark:border-zinc-800/80 ml-2 space-y-0.5">
                          {/* Subfolders */}
                          {subFolders.map((sub) => {
                            const isSubExpanded = !!expandedFolders[sub.id];
                            const subFiles = filteredFiles.filter((f) => f.folderId === sub.id);
                            return (
                              <div key={sub.id} className="space-y-0.5">
                                <div
                                  onClick={() => toggleFolder(sub.id)}
                                  className="flex items-center justify-between px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer text-zinc-700 dark:text-zinc-300"
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    {isSubExpanded ? (
                                      <ChevronDown className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                                    )}
                                    <Folder className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                                    <span className="truncate">{sub.name}</span>
                                  </div>
                                </div>

                                {isSubExpanded && (
                                  <div className="pl-3 space-y-0.5">
                                    {subFiles.map((file) => (
                                      <FileItemRow
                                        key={file.id}
                                        file={file}
                                        isActive={currentFileId === file.id}
                                        onSelect={() => onSelectFile(file.id)}
                                        onDelete={() => onDeleteFile(file.id)}
                                        onToggleFavorite={() => onToggleFavorite(file.id)}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Direct Folder Files */}
                          {folderFiles.map((file) => (
                            <FileItemRow
                              key={file.id}
                              file={file}
                              isActive={currentFileId === file.id}
                              onSelect={() => onSelectFile(file.id)}
                              onDelete={() => onDeleteFile(file.id)}
                              onToggleFavorite={() => onToggleFavorite(file.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* Loose Files (Not in folder) */}
              {filteredFiles
                .filter((f) => !f.folderId)
                .map((file) => (
                  <FileItemRow
                    key={file.id}
                    file={file}
                    isActive={currentFileId === file.id}
                    onSelect={() => onSelectFile(file.id)}
                    onDelete={() => onDeleteFile(file.id)}
                    onToggleFavorite={() => onToggleFavorite(file.id)}
                  />
                ))}
            </div>
          </div>
        )}

        {/* TAB 2: PROMPT LIBRARY */}
        {activeTab === 'prompts' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-900 dark:text-white" /> Prompt Collection
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                {filteredFiles.length} prompts
              </span>
            </div>

            {/* Quick Action Banner for Prompt Hub */}
            <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
              <button
                onClick={onOpenPromptLibraryHub}
                className="w-full px-3 py-1.5 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 fill-white dark:fill-zinc-950" />
                <span>Open Prompt Studio Hub</span>
              </button>

              {onNewPromptTemplate && (
                <button
                  onClick={onNewPromptTemplate}
                  className="w-full px-3 py-1 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Custom Prompt Template</span>
                </button>
              )}
            </div>

            {/* Prompt Files List */}
            <div className="space-y-1.5">
              {filteredFiles.map((file) => {
                const varMatches = file.content.match(/\{\{([a-zA-Z0-9_-]+)\}\}/g) || [];
                const varCount = new Set(varMatches).size;

                return (
                  <div
                    key={file.id}
                    onClick={() => onSelectFile(file.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      currentFileId === file.id
                        ? 'bg-zinc-200 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-600 text-zinc-900 dark:text-white shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-medium text-xs mb-1">
                      <span className="truncate font-semibold capitalize">
                        {file.name.replace(/\.md$/, '').replace(/-/g, ' ')}
                      </span>
                      {varCount > 0 ? (
                        <span className="px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[10px] font-mono border border-zinc-300 dark:border-zinc-700 shrink-0">
                          {varCount} vars
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-950 text-zinc-500 text-[9px] shrink-0 border border-zinc-200 dark:border-zinc-800">
                          static
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-2 font-sans">
                      {file.content.replace(/#|\*|`|>|\[|\]/g, '').slice(0, 100)}...
                    </p>

                    {/* Tags */}
                    {file.tags && file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {file.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 text-[10px] border border-zinc-200 dark:border-zinc-800 font-mono"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: TABLE OF CONTENTS (TOC) */}
        {activeTab === 'toc' && (
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-2 py-1">
              Document Outline ({toc.length})
            </div>

            {toc.length === 0 ? (
              <p className="text-zinc-400 dark:text-zinc-500 text-center py-6 italic text-xs">
                No headings found in current document
              </p>
            ) : (
              <div className="space-y-1">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const targetEl = document.getElementById(item.id);
                      if (targetEl) {
                        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
                    className="block py-1 pr-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded transition-colors text-xs truncate cursor-pointer"
                  >
                    {item.text}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags Filtering Section */}
        {allTags.length > 0 && (
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-2 mb-1.5">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-zinc-400 dark:text-zinc-500" /> Filter Tags
              </span>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-[10px] text-zinc-600 dark:text-zinc-300 hover:underline cursor-pointer"
                >
                  Clear Filter
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1 px-1">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-all cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

// Sub-component for individual file list item
const FileItemRow: React.FC<{
  file: MDFile;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}> = ({ file, isActive, onSelect, onDelete, onToggleFavorite }) => {
  return (
    <div
      onClick={onSelect}
      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${
        isActive
          ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 font-medium shadow-xs'
          : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'}`} />
        <span className="truncate">{file.name}</span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="p-0.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
          title="Toggle Favorite Pin"
        >
          <Star className={`w-3 h-3 ${file.isFavorite ? 'fill-zinc-900 dark:fill-zinc-200 text-zinc-900 dark:text-zinc-200' : ''}`} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-0.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
          title="Delete file"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
