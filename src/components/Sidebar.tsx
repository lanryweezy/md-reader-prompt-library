import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  Files,
  Plus,
  Search,
  Star,
  Trash2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ListTree,
  Check,
  X,
  Pencil,
  FolderPlus,
  FilePlus,
} from 'lucide-react';
import { MDFile, MDFolder, TOCItem } from '../types';

interface SidebarProps {
  files: MDFile[];
  folders: MDFolder[];
  currentFileId?: string;
  activeTab: 'files' | 'prompts' | 'toc';
  setActiveTab: (tab: 'files' | 'prompts' | 'toc') => void;
  toc: TOCItem[];
  onSelectFile: (fileId: string) => void;
  onNewFile: (folderId?: string, customName?: string) => void;
  onNewFolder: (folderName: string) => string | void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onDeleteFile: (fileId: string) => void;
  onToggleFavorite: (fileId: string) => void;
  onOpenPromptLibraryHub?: () => void;
  onNewPromptTemplate: (title?: string, tags?: string[]) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  files,
  folders,
  currentFileId,
  activeTab,
  setActiveTab,
  toc,
  onSelectFile,
  onNewFile,
  onNewFolder,
  onDeleteFolder,
  onRenameFile,
  onDeleteFile,
  onToggleFavorite,
  onOpenPromptLibraryHub,
  onNewPromptTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'f-prompts': true,
  });

  // Inline creation state for Workspace (+ button)
  const [workspaceCreateMode, setWorkspaceCreateMode] = useState<'file' | 'folder' | null>(null);
  const [workspaceCreateName, setWorkspaceCreateName] = useState('');

  // Inline creation state for adding a file inside a specific folder
  const [creatingInFolderId, setCreatingInFolderId] = useState<string | null>(null);
  const [folderFileName, setFolderFileName] = useState('');

  // Inline creation state for adding a new user prompt
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptTags, setNewPromptTags] = useState('');

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const filteredFiles = files.filter((file) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      file.name.toLowerCase().includes(q) ||
      file.content.toLowerCase().includes(q) ||
      file.tags.some((t) => t.toLowerCase().includes(q));

    if (activeTab === 'prompts') {
      return (file.isPrompt || file.tags.includes('ai-prompt')) && matchesSearch;
    }

    return matchesSearch;
  });

  const favoriteFiles = files.filter((f) => f.isFavorite);

  const handleWorkspaceCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = workspaceCreateName.trim();
    if (!trimmed) return;

    if (workspaceCreateMode === 'folder') {
      const createdId = onNewFolder(trimmed);
      if (createdId) {
        setExpandedFolders((prev) => ({ ...prev, [createdId]: true }));
      }
    } else if (workspaceCreateMode === 'file') {
      onNewFile(undefined, trimmed);
    }

    setWorkspaceCreateName('');
    setWorkspaceCreateMode(null);
  };

  const handleFolderFileSubmit = (e: React.FormEvent, folderId: string) => {
    e.preventDefault();
    const trimmed = folderFileName.trim();
    if (!trimmed) return;
    onNewFile(folderId, trimmed);
    setFolderFileName('');
    setCreatingInFolderId(null);
  };

  const handleCreatePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = newPromptTitle.trim();
    if (!trimmedTitle) return;
    const parsedTags = newPromptTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    onNewPromptTemplate(trimmedTitle, parsedTags);
    setNewPromptTitle('');
    setNewPromptTags('');
    setIsCreatingPrompt(false);
  };

  const handleHeaderPlusClick = () => {
    if (activeTab === 'prompts') {
      setIsCreatingPrompt(true);
    } else {
      setActiveTab('files');
      setWorkspaceCreateMode('file');
      setWorkspaceCreateName('');
    }
  };

  return (
    <aside className="w-60 bg-zinc-50/70 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col h-full select-none text-zinc-700 dark:text-zinc-300 text-xs shrink-0">
      {/* Sidebar Header: Icon-only Navigation on Left + Quick Add on Right */}
      <div className="h-9 px-2 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between gap-1 shrink-0">
        <div className="flex items-center gap-1" role="tablist" aria-label="Sidebar views">
          <button
            role="tab"
            aria-selected={activeTab === 'files'}
            onClick={() => setActiveTab('files')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'files'
                ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-900'
            }`}
            title="Files"
            aria-label="Files"
          >
            <Files className="w-3.5 h-3.5" />
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'prompts'}
            onClick={() => setActiveTab('prompts')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'prompts'
                ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-900'
            }`}
            title="Prompts"
            aria-label="Prompts"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'toc'}
            onClick={() => setActiveTab('toc')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'toc'
                ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-900'
            }`}
            title="Outline"
            aria-label="Outline"
          >
            <ListTree className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={handleHeaderPlusClick}
          className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title={activeTab === 'prompts' ? 'Add Prompt' : 'New File'}
          aria-label={activeTab === 'prompts' ? 'Add Prompt' : 'New File'}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quiet Search Input (shown for Files & Prompts) */}
      {activeTab !== 'toc' && (
        <div className="px-2.5 pt-2.5 pb-1.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'prompts' ? 'Filter prompts...' : 'Filter files...'}
              className="w-full pl-8 pr-6 py-1.5 bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 rounded-md text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer text-xs"
                title="Clear filter"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2 space-y-4">
        {/* TAB 1: FILES & FOLDERS */}
        {activeTab === 'files' && (
          <div className="space-y-4">
            {favoriteFiles.length > 0 && !searchQuery && (
              <div>
                <div className="px-2 py-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                  Favorites
                </div>
                <div className="space-y-0.5">
                  {favoriteFiles.map((file) => (
                    <FileItemRow
                      key={`fav-${file.id}`}
                      file={file}
                      isActive={currentFileId === file.id}
                      onSelect={() => onSelectFile(file.id)}
                      onRename={(newName) => onRenameFile(file.id, newName)}
                      onDelete={() => onDeleteFile(file.id)}
                      onToggleFavorite={() => onToggleFavorite(file.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between px-2 py-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                <span>Workspace</span>
                <button
                  onClick={() => {
                    setWorkspaceCreateMode((prev) => (prev ? null : 'file'));
                    setWorkspaceCreateName('');
                  }}
                  className="p-0.5 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                  title="New file or folder"
                  aria-label="Create new file or folder in workspace"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Inline Workspace File / Folder Creator */}
              {workspaceCreateMode && (
                <form
                  onSubmit={handleWorkspaceCreateSubmit}
                  className="mx-1 mb-2 p-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5"
                >
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setWorkspaceCreateMode('file')}
                      className={`flex-1 py-1 rounded flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                        workspaceCreateMode === 'file'
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <FilePlus className="w-3 h-3" />
                      <span>File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkspaceCreateMode('folder')}
                      className={`flex-1 py-1 rounded flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                        workspaceCreateMode === 'folder'
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <FolderPlus className="w-3 h-3" />
                      <span>Folder</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={workspaceCreateName}
                      onChange={(e) => setWorkspaceCreateName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setWorkspaceCreateMode(null);
                          setWorkspaceCreateName('');
                        }
                      }}
                      placeholder={
                        workspaceCreateMode === 'folder' ? 'Folder name...' : 'note-name.md'
                      }
                      autoFocus
                      className="flex-1 min-w-0 px-2 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                    />
                    <button
                      type="submit"
                      className="p-1 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:opacity-90 cursor-pointer shrink-0"
                      title="Create"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWorkspaceCreateMode(null);
                        setWorkspaceCreateName('');
                      }}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer shrink-0"
                      title="Cancel"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </form>
              )}

              {folders
                .filter((f) => !f.parentId)
                .map((folder) => {
                  const isExpanded = !!expandedFolders[folder.id];
                  const folderFiles = filteredFiles.filter((f) => f.folderId === folder.id);
                  const subFolders = folders.filter((f) => f.parentId === folder.id);

                  return (
                    <div key={folder.id} className="space-y-0.5">
                      <div
                        onClick={() => toggleFolder(folder.id)}
                        className="group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-zinc-200/60 dark:hover:bg-zinc-900 cursor-pointer text-zinc-700 dark:text-zinc-300 font-medium"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
                          )}
                          {isExpanded ? (
                            <FolderOpen className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                          ) : (
                            <Folder className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                          )}
                          <span className="truncate">{folder.name}</span>
                        </div>

                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedFolders((prev) => ({ ...prev, [folder.id]: true }));
                              setCreatingInFolderId(folder.id);
                              setFolderFileName('');
                            }}
                            className="p-0.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                            title={`New file in ${folder.name}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteFolder(folder.id);
                            }}
                            className="p-0.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                            title="Delete folder (files move to workspace)"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="pl-3.5 ml-2.5 border-l border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5">
                          {creatingInFolderId === folder.id && (
                            <form
                              onSubmit={(e) => handleFolderFileSubmit(e, folder.id)}
                              className="flex items-center gap-1 py-1 pr-1"
                            >
                              <input
                                type="text"
                                value={folderFileName}
                                onChange={(e) => setFolderFileName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') {
                                    setCreatingInFolderId(null);
                                    setFolderFileName('');
                                  }
                                }}
                                placeholder="filename.md"
                                autoFocus
                                className="flex-1 min-w-0 px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                              />
                              <button
                                type="submit"
                                className="p-1 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 cursor-pointer"
                                title="Add file"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCreatingInFolderId(null);
                                  setFolderFileName('');
                                }}
                                className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </form>
                          )}

                          {subFolders.map((sub) => {
                            const isSubExpanded = !!expandedFolders[sub.id];
                            const subFiles = filteredFiles.filter((f) => f.folderId === sub.id);
                            return (
                              <div key={sub.id} className="space-y-0.5">
                                <div
                                  onClick={() => toggleFolder(sub.id)}
                                  className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-zinc-200/60 dark:hover:bg-zinc-900 cursor-pointer text-zinc-600 dark:text-zinc-400"
                                >
                                  {isSubExpanded ? (
                                    <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
                                  )}
                                  <Folder className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                  <span className="truncate">{sub.name}</span>
                                </div>

                                {isSubExpanded && (
                                  <div className="pl-3 space-y-0.5">
                                    {subFiles.map((file) => (
                                      <FileItemRow
                                        key={file.id}
                                        file={file}
                                        isActive={currentFileId === file.id}
                                        onSelect={() => onSelectFile(file.id)}
                                        onRename={(newName) => onRenameFile(file.id, newName)}
                                        onDelete={() => onDeleteFile(file.id)}
                                        onToggleFavorite={() => onToggleFavorite(file.id)}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {folderFiles.map((file) => (
                            <FileItemRow
                              key={file.id}
                              file={file}
                              isActive={currentFileId === file.id}
                              onSelect={() => onSelectFile(file.id)}
                              onRename={(newName) => onRenameFile(file.id, newName)}
                              onDelete={() => onDeleteFile(file.id)}
                              onToggleFavorite={() => onToggleFavorite(file.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

              {filteredFiles
                .filter((f) => !f.folderId)
                .map((file) => (
                  <FileItemRow
                    key={file.id}
                    file={file}
                    isActive={currentFileId === file.id}
                    onSelect={() => onSelectFile(file.id)}
                    onRename={(newName) => onRenameFile(file.id, newName)}
                    onDelete={() => onDeleteFile(file.id)}
                    onToggleFavorite={() => onToggleFavorite(file.id)}
                  />
                ))}

              {filteredFiles.length === 0 && !workspaceCreateMode && (
                <p className="text-zinc-400 dark:text-zinc-500 text-center py-6 text-xs">
                  {searchQuery ? 'No matching files' : 'Workspace is empty'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PROMPT LIBRARY */}
        {activeTab === 'prompts' && (
          <div className="space-y-2.5">
            {!isCreatingPrompt ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsCreatingPrompt(true)}
                  className="flex-1 px-2.5 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Prompt</span>
                </button>
                {onOpenPromptLibraryHub && (
                  <button
                    onClick={onOpenPromptLibraryHub}
                    className="px-2 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200/60 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                    title="Open Prompt Studio"
                    aria-label="Open Prompt Studio"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <form
                onSubmit={handleCreatePromptSubmit}
                className="p-2.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2"
              >
                <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
                  <span>New Prompt</span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingPrompt(false)}
                    className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="text"
                  value={newPromptTitle}
                  onChange={(e) => setNewPromptTitle(e.target.value)}
                  placeholder="Prompt title..."
                  autoFocus
                  className="w-full px-2 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                />
                <input
                  type="text"
                  value={newPromptTags}
                  onChange={(e) => setNewPromptTags(e.target.value)}
                  placeholder="Tags (optional, comma-separated)"
                  className="w-full px-2 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                />
                <button
                  type="submit"
                  disabled={!newPromptTitle.trim()}
                  className="w-full py-1.5 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium text-xs disabled:opacity-40 cursor-pointer"
                >
                  Create & Edit
                </button>
              </form>
            )}

            {filteredFiles.length === 0 ? (
              <p className="text-zinc-400 dark:text-zinc-500 text-center py-6 text-xs">
                {searchQuery ? 'No matching prompts' : 'No prompts yet. Click Add Prompt to create one.'}
              </p>
            ) : (
              <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
                {filteredFiles.map((file) => {
                  const varMatches = file.content.match(/\{\{([a-zA-Z0-9_-]+)\}\}/g) || [];
                  const varCount = new Set(varMatches).size;
                  const primaryTag = file.tags?.find((t) => t !== 'ai-prompt');

                  return (
                    <div
                      key={file.id}
                      onClick={() => onSelectFile(file.id)}
                      className={`group px-2 py-2.5 cursor-pointer transition-colors rounded-md flex items-start justify-between gap-2 ${
                        currentFileId === file.id
                          ? 'bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-white'
                          : 'hover:bg-zinc-200/40 dark:hover:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-xs truncate capitalize">
                          {file.name.replace(/\.md$/, '').replace(/-/g, ' ')}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5">
                          <span>{varCount > 0 ? `${varCount} vars` : 'Editable'}</span>
                          {primaryTag && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="truncate">{primaryTag}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFile(file.id);
                        }}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                        title="Delete prompt"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: OUTLINE / TOC */}
        {activeTab === 'toc' && (
          <div className="space-y-1">
            {toc.length === 0 ? (
              <p className="text-zinc-400 dark:text-zinc-500 text-center py-8 text-xs">
                No headings in this document
              </p>
            ) : (
              toc.map((item) => (
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
                  className="block py-1.5 pr-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-900 rounded-md transition-colors text-xs truncate cursor-pointer"
                >
                  {item.text}
                </a>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

const FileItemRow: React.FC<{
  file: MDFile;
  isActive: boolean;
  onSelect: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}> = ({ file, isActive, onSelect, onRename, onDelete, onToggleFavorite }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(file.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const commitRename = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== file.name) {
      onRename(trimmed);
    }
    setIsRenaming(false);
  };

  if (isRenaming) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          commitRename();
        }}
        className="flex items-center gap-1 px-1.5 py-1"
      >
        <input
          type="text"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setDraftName(file.name);
              setIsRenaming(false);
            }
          }}
          autoFocus
          className="flex-1 min-w-0 px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
        />
      </form>
    );
  }

  return (
    <div
      onClick={onSelect}
      onDoubleClick={() => {
        setDraftName(file.name);
        setIsRenaming(true);
      }}
      className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
        isActive
          ? 'bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-white font-medium'
          : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        <FileText
          className={`w-3.5 h-3.5 shrink-0 ${
            isActive ? 'text-zinc-700 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-500'
          }`}
        />
        <span className="truncate">{file.name}</span>
      </div>

      {confirmingDelete ? (
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setConfirmingDelete(false);
              onDelete();
            }}
            className="p-0.5 rounded bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
            title="Confirm delete"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={() => setConfirmingDelete(false)}
            className="p-0.5 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
            title="Cancel"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDraftName(file.name);
              setIsRenaming(true);
            }}
            className="p-0.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
            title="Rename"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="p-0.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
            title={file.isFavorite ? 'Remove favorite' : 'Favorite'}
          >
            <Star
              className={`w-3 h-3 ${
                file.isFavorite ? 'fill-zinc-700 dark:fill-zinc-300 text-zinc-700 dark:text-zinc-300' : ''
              }`}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmingDelete(true);
            }}
            className="p-0.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
            title="Delete file"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
