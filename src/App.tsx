import React, { useState, useEffect, useRef } from 'react';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { EditorToolbar } from './components/EditorToolbar';
import { EditorTabBar } from './components/EditorTabBar';
import { CommandPalette } from './components/CommandPalette';
import { MarkdownEditor } from './components/MarkdownEditor';
import { MarkdownPreview } from './components/MarkdownPreview';
import { PromptFillModal } from './components/PromptFillModal';
import { PromptLibraryModal } from './components/PromptLibraryModal';
import { PromptActionBar } from './components/PromptActionBar';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { ElectronExportModal } from './components/ElectronExportModal';
import { ImageInsertionModal } from './components/ImageInsertionModal';
import { TableGeneratorModal } from './components/TableGeneratorModal';
import { StatusBar } from './components/StatusBar';
import { INITIAL_FILES, INITIAL_FOLDERS } from './data/defaultPrompts';
import { MDFile, MDFolder, EditorSettings, ViewMode, FileVersion } from './types';
import { extractTableOfContents, extractPromptVariables, getDocumentStats } from './utils/markdownParser';
import { downloadTextFile } from './utils/electronExport';
import { UploadCloud } from 'lucide-react';

export default function App() {
  // LocalStorage state initialization
  const [files, setFiles] = useState<MDFile[]>(() => {
    const saved = localStorage.getItem('md_app_files');
    return saved ? JSON.parse(saved) : INITIAL_FILES;
  });

  const [folders, setFolders] = useState<MDFolder[]>(() => {
    const saved = localStorage.getItem('md_app_folders');
    return saved ? JSON.parse(saved) : INITIAL_FOLDERS;
  });

  const [currentFileId, setCurrentFileId] = useState<string>(() => {
    return files.length > 0 ? files[0].id : '';
  });

  const [openFileIds, setOpenFileIds] = useState<string[]>(() => {
    return files.length > 0 ? [files[0].id] : [];
  });

  const [activeTab, setActiveTab] = useState<'files' | 'prompts' | 'toc'>('files');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isPromptHubOpen, setIsPromptHubOpen] = useState(false);
  const [isElectronModalOpen, setIsElectronModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Version snapshots state
  const [versions, setVersions] = useState<FileVersion[]>(() => {
    const saved = localStorage.getItem('md_app_versions');
    if (saved) return JSON.parse(saved);
    return INITIAL_FILES.map((f, idx) => ({
      id: `v-init-${f.id}`,
      fileId: f.id,
      timestamp: Date.now() - 3600000 * (idx + 1),
      label: 'Initial Draft Template',
      content: f.content,
      wordCount: getDocumentStats(f.content).words,
    }));
  });

  useEffect(() => {
    localStorage.setItem('md_app_versions', JSON.stringify(versions));
  }, [versions]);

  const [settings, setSettings] = useState<EditorSettings>(() => {
    const saved = localStorage.getItem('md_app_settings');
    return saved
      ? JSON.parse(saved)
      : {
          theme: 'dark',
          accentColor: 'zinc',
          fontStyle: 'sans',
          fontSize: 15,
          wordWrap: true,
          lineNumbers: true,
          autoSave: true,
          syncScroll: true,
        };
  });

  // Editor and preview scroll refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  // Active file object
  const activeFile = files.find((f) => f.id === currentFileId) || files[0];

  // Select file handler ensuring file is in open tabs
  const handleSelectFile = (id: string) => {
    setCurrentFileId(id);
    if (!openFileIds.includes(id)) {
      setOpenFileIds((prev) => [...prev, id]);
    }
  };

  // Close file tab handler
  const handleCloseTab = (id: string) => {
    const nextOpen = openFileIds.filter((tabId) => tabId !== id);
    setOpenFileIds(nextOpen);
    if (currentFileId === id && nextOpen.length > 0) {
      setCurrentFileId(nextOpen[nextOpen.length - 1]);
    }
  };

  // Save to LocalStorage whenever files or settings change
  useEffect(() => {
    localStorage.setItem('md_app_files', JSON.stringify(files));
    if (files.length > 0 && !files.some((f) => f.id === currentFileId)) {
      setCurrentFileId(files[0].id);
    }
  }, [files, currentFileId]);

  useEffect(() => {
    localStorage.setItem('md_app_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('md_app_settings', JSON.stringify(settings));
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Update file content
  const handleContentChange = (newContent: string) => {
    if (!activeFile) return;

    const hasPromptVars = /\{\{([a-zA-Z0-9_-]+)\}\}/.test(newContent);

    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFile.id
          ? {
              ...f,
              content: newContent,
              updatedAt: Date.now(),
              isPrompt: f.isPrompt || hasPromptVars,
            }
          : f
      )
    );
  };

  // Version history snapshot actions
  const handleCreateSnapshot = (fileId: string, label?: string) => {
    const target = files.find((f) => f.id === fileId);
    if (!target) return;
    const stats = getDocumentStats(target.content);
    const newVersion: FileVersion = {
      id: `v-${Date.now()}`,
      fileId,
      timestamp: Date.now(),
      label: label || `Snapshot ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      content: target.content,
      wordCount: stats.words,
    };
    setVersions((prev) => [newVersion, ...prev]);
  };

  const handleRestoreVersion = (version: FileVersion) => {
    if (activeFile) {
      handleCreateSnapshot(activeFile.id, `Pre-Restore Auto Snapshot`);
    }
    handleContentChange(version.content);
  };

  const handleDeleteVersion = (versionId: string) => {
    setVersions((prev) => prev.filter((v) => v.id !== versionId));
  };

  // Synchronized scrolling between editor & preview
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (!settings.syncScroll || !previewRef.current || isSyncingScroll.current) return;
    isSyncingScroll.current = true;

    const target = e.currentTarget;
    const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight || 1);
    const previewEl = previewRef.current;
    previewEl.scrollTop = percentage * (previewEl.scrollHeight - previewEl.clientHeight);

    setTimeout(() => {
      isSyncingScroll.current = false;
    }, 50);
  };

  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!settings.syncScroll || !textareaRef.current || isSyncingScroll.current) return;
    isSyncingScroll.current = true;

    const target = e.currentTarget;
    const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight || 1);
    const editorEl = textareaRef.current;
    editorEl.scrollTop = percentage * (editorEl.scrollHeight - editorEl.clientHeight);

    setTimeout(() => {
      isSyncingScroll.current = false;
    }, 50);
  };

  // Keyboard Shortcuts: Ctrl+S (Save), Ctrl+N (New File), Ctrl+O (Open)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeFile) {
          downloadTextFile(activeFile.name, activeFile.content);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewFile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile]);

  // Formatting helpers for EditorToolbar
  const handleFormat = (prefix: string, suffix: string = '', defaultText: string = 'text') => {
    if (!textareaRef.current || !activeFile) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = activeFile.content.substring(start, end) || defaultText;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent =
      activeFile.content.substring(0, start) + replacement + activeFile.content.substring(end);

    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  const handleInsertSnippet = (snippet: string) => {
    if (!textareaRef.current || !activeFile) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newContent =
      activeFile.content.substring(0, start) + snippet + activeFile.content.substring(end);

    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 0);
  };

  // File Operations
  const handleNewFile = (folderId?: string) => {
    const fileNum = files.length + 1;
    const newFile: MDFile = {
      id: `file-${Date.now()}`,
      name: `untitled-note-${fileNum}.md`,
      path: folderId ? `/Folder/untitled-note-${fileNum}.md` : `/untitled-note-${fileNum}.md`,
      folderId,
      content: `# New Document\n\nStart writing your Markdown content here...\n`,
      tags: ['draft'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setFiles((prev) => [newFile, ...prev]);
    setCurrentFileId(newFile.id);
  };

  const handleNewFolder = () => {
    const folderName = prompt('Enter folder name:', 'New Category');
    if (!folderName) return;

    const newFolder: MDFolder = {
      id: `f-${Date.now()}`,
      name: folderName,
      icon: 'folder',
    };

    setFolders((prev) => [...prev, newFolder]);
  };

  const handleNewPromptTemplate = () => {
    const promptNum = files.filter((f) => f.isPrompt).length + 1;
    const newPrompt: MDFile = {
      id: `p-custom-${Date.now()}`,
      name: `custom-prompt-template-${promptNum}.md`,
      path: `/Prompt Library/custom-prompt-template-${promptNum}.md`,
      folderId: 'f-prompts',
      tags: ['ai-prompt', 'custom-template'],
      isPrompt: true,
      isFavorite: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content: `# ⚡ Custom AI Prompt Template ${promptNum}

## Role & Goal
You are a {{target_role}} assisting with {{primary_task}}.

---

## Input Variables
- **Target Subject**: {{subject_name}}
- **Tone & Style**: {{desired_tone}}
- **Output Length**: {{output_format}}

---

## Instructions & Requirements
1. Analyze input parameter {{subject_name}} thoroughly.
2. Provide a structured response following {{output_format}}.
3. Maintain a {{desired_tone}} approach with clear bullet points.
`,
    };

    setFiles((prev) => [newPrompt, ...prev]);
    handleSelectFile(newPrompt.id);
  };

  const handleDuplicatePrompt = () => {
    if (!activeFile) return;
    const duplicated: MDFile = {
      ...activeFile,
      id: `file-${Date.now()}`,
      name: `copy-of-${activeFile.name}`,
      path: activeFile.path.replace(activeFile.name, `copy-of-${activeFile.name}`),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setFiles((prev) => [duplicated, ...prev]);
    handleSelectFile(duplicated.id);
  };

  const handleDeleteFile = (fileId: string) => {
    if (files.length <= 1) {
      alert('Cannot delete the last document in your workspace.');
      return;
    }

    if (confirm('Are you sure you want to delete this file?')) {
      const remaining = files.filter((f) => f.id !== fileId);
      setFiles(remaining);
      if (currentFileId === fileId) {
        setCurrentFileId(remaining[0].id);
      }
    }
  };

  const handleToggleFavorite = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isFavorite: !f.isFavorite } : f))
    );
  };

  // Import files from user computer
  const handleImportFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const importedList = e.target.files;
    if (!importedList || importedList.length === 0) return;

    Array.from(importedList).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const newFile: MDFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          path: `/${file.name}`,
          content: text || '',
          tags: file.name.includes('prompt') ? ['imported', 'ai-prompt'] : ['imported'],
          isPrompt: file.name.includes('prompt') || /\{\{([a-zA-Z0-9_-]+)\}\}/.test(text || ''),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        setFiles((prev) => [newFile, ...prev]);
        setCurrentFileId(newFile.id);
      };
      reader.readAsText(file);
    });
  };

  // HTML5 Directory Picker API or Native File Picker
  const handleImportDirectory = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker();
        const importedFiles: MDFile[] = [];

        // Recursive directory scanner
        async function scanDir(handle: any, currentPath: string) {
          for await (const entry of handle.values()) {
            if (entry.kind === 'file' && (entry.name.endsWith('.md') || entry.name.endsWith('.markdown'))) {
              const fileData = await entry.getFile();
              const text = await fileData.text();
              importedFiles.push({
                id: `dir-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                name: entry.name,
                path: `${currentPath}/${entry.name}`,
                content: text,
                tags: ['directory-import'],
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });
            } else if (entry.kind === 'directory' && !entry.name.startsWith('.')) {
              await scanDir(entry, `${currentPath}/${entry.name}`);
            }
          }
        }

        await scanDir(dirHandle, dirHandle.name);

        if (importedFiles.length > 0) {
          setFiles((prev) => [...importedFiles, ...prev]);
          setCurrentFileId(importedFiles[0].id);
        } else {
          alert('No .md files found in selected directory.');
        }
      } catch (err) {
        console.log('Directory selection canceled or unavailable:', err);
      }
    } else {
      alert('Directory Access API is not supported in this browser mode. Please drag and drop files instead.');
    }
  };

  // Keyboard shortcuts listener (Cmd/Ctrl + K for Command Palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Drag and Drop file handler on full app window
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.clientX === 0 && e.clientY === 0) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file: File) => {
        if (file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.name.endsWith('.txt')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const text = event.target?.result as string;
            const newFile: MDFile = {
              id: `drop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name: file.name,
              path: `/${file.name}`,
              content: text || '',
              tags: ['dropped-file'],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };

            setFiles((prev) => [newFile, ...prev]);
            handleSelectFile(newFile.id);
          };
          reader.readAsText(file);
        }
      });
    }
  };

  // Extract variables & Table of Contents for active document
  const promptVariables = activeFile ? extractPromptVariables(activeFile.content) : [];
  const toc = activeFile ? extractTableOfContents(activeFile.content) : [];

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col h-screen w-screen overflow-hidden relative ${
        settings.theme === 'dark' ? 'dark bg-zinc-950 text-zinc-100' : 'bg-zinc-100 text-zinc-900'
      }`}
    >
      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm border-4 border-dashed border-zinc-100 flex flex-col items-center justify-center text-zinc-100 animate-in fade-in duration-150">
          <UploadCloud className="w-16 h-16 text-zinc-100 animate-bounce mb-3" />
          <p className="text-lg font-bold tracking-wide font-mono">Drop .md, .markdown, or .txt files here</p>
          <p className="text-xs text-zinc-400 mt-1 font-mono">Files will be imported instantly into your workspace</p>
        </div>
      )}

      {/* Top Title Bar */}
      <TitleBar
        currentFileName={activeFile?.name}
        settings={settings}
        onUpdateSettings={(newS) => setSettings((s) => ({ ...s, ...newS }))}
        onNewFile={() => handleNewFile()}
        onOpenFile={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.md,.markdown,.txt';
          input.multiple = true;
          input.onchange = (e) => handleImportFiles(e as any);
          input.click();
        }}
        onOpenFolder={handleImportDirectory}
        onSaveFile={() => activeFile && downloadTextFile(activeFile.name, activeFile.content)}
        onExportElectron={() => setIsElectronModalOpen(true)}
        onOpenPromptFill={() => setIsPromptModalOpen(true)}
        hasVariables={promptVariables.length > 0}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenPromptHub={() => setIsPromptHubOpen(true)}
        onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar (Hidden in Focus / Zen mode for full immersion) */}
        {viewMode !== 'focus' && (
          <Sidebar
            files={files}
            folders={folders}
            currentFileId={currentFileId}
            activeTab={activeTab}
            toc={toc}
            onSelectFile={handleSelectFile}
            onNewFile={handleNewFile}
            onNewFolder={handleNewFolder}
            onDeleteFile={handleDeleteFile}
            onToggleFavorite={handleToggleFavorite}
            onImportFiles={handleImportFiles}
            onImportDirectory={handleImportDirectory}
            onOpenPromptLibraryHub={() => setIsPromptHubOpen(true)}
            onNewPromptTemplate={handleNewPromptTemplate}
          />
        )}

        {/* Center Content: Editor & Preview */}
        <main className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
          {/* Zen Focus Mode Floating Header Indicator */}
          {viewMode === 'focus' && (
            <div className="bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 text-xs px-4 py-2 flex items-center justify-between text-zinc-300 z-10 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-zinc-100">Zen Focus Mode Active</span>
                <span className="text-zinc-500">|</span>
                <span className="text-zinc-400 truncate max-w-xs">{activeFile?.name}</span>
              </div>
              <button
                onClick={() => setViewMode('split')}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md font-medium text-xs transition-colors cursor-pointer border border-zinc-700"
              >
                Exit Focus Mode
              </button>
            </div>
          )}
          {/* Open Tabs Bar */}
          <EditorTabBar
            openFileIds={openFileIds}
            files={files}
            currentFileId={currentFileId}
            onSelectFile={handleSelectFile}
            onCloseTab={handleCloseTab}
            onNewFile={handleNewFile}
          />

          {activeFile ? (
            <>
              {/* Toolbar */}
              <EditorToolbar
                viewMode={viewMode}
                onChangeViewMode={setViewMode}
                onFormat={handleFormat}
                onInsertSnippet={handleInsertSnippet}
                onOpenPromptFill={() => setIsPromptModalOpen(true)}
                hasVariables={promptVariables.length > 0}
                onCopyRaw={() => navigator.clipboard.writeText(activeFile.content)}
                onDownload={() => downloadTextFile(activeFile.name, activeFile.content)}
                onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
                onOpenImageModal={() => setIsImageModalOpen(true)}
                onOpenTableModal={() => setIsTableModalOpen(true)}
                settings={settings}
                onUpdateSettings={(newS) => setSettings((s) => ({ ...s, ...newS }))}
              />

              {/* Dedicated Prompt Action Bar when file is a prompt template or contains variables */}
              {(activeFile.isPrompt || promptVariables.length > 0) && (
                <PromptActionBar
                  content={activeFile.content}
                  onOpenFillModal={() => setIsPromptModalOpen(true)}
                  onDuplicatePrompt={handleDuplicatePrompt}
                />
              )}

              {/* View Container based on ViewMode */}
              <div className="flex-1 flex overflow-hidden relative">
                {/* Editor View (Shown in 'split' or 'edit') */}
                {(viewMode === 'split' || viewMode === 'edit') && (
                  <div className={`flex-1 flex flex-col h-full border-r border-zinc-800`}>
                    <MarkdownEditor
                      content={activeFile.content}
                      onChange={handleContentChange}
                      settings={settings}
                      textareaRef={textareaRef}
                      onScroll={handleEditorScroll}
                    />
                  </div>
                )}

                {/* Preview View (Shown in 'split', 'preview', or 'focus') */}
                {(viewMode === 'split' || viewMode === 'preview' || viewMode === 'focus') && (
                  <div
                    className={`flex-1 flex flex-col h-full ${
                      viewMode === 'focus' ? 'max-w-4xl mx-auto border-x border-zinc-800' : ''
                    }`}
                  >
                    <MarkdownPreview
                      content={activeFile.content}
                      settings={settings}
                      previewRef={previewRef}
                      onContentChange={handleContentChange}
                      onScroll={handlePreviewScroll}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
              <p>No file selected. Create or open a .md file from the sidebar.</p>
            </div>
          )}
        </main>
      </div>

      {/* Bottom Status Bar */}
      {activeFile && (
        <StatusBar
          content={activeFile.content}
          filePath={activeFile.path}
          viewMode={viewMode}
          settings={settings}
          onUpdateSettings={(newS) => setSettings((s) => ({ ...s, ...newS }))}
        />
      )}

      {/* Prompt Variable Filler Modal */}
      {activeFile && isPromptModalOpen && (
        <PromptFillModal
          isOpen={isPromptModalOpen}
          onClose={() => setIsPromptModalOpen(false)}
          rawContent={activeFile.content}
          onApplyToEditor={handleContentChange}
        />
      )}

      {/* Interactive Prompt Library Studio Hub Modal */}
      <PromptLibraryModal
        isOpen={isPromptHubOpen}
        onClose={() => setIsPromptHubOpen(false)}
        files={files}
        onSelectFile={handleSelectFile}
        onOpenFillModalForFile={(fileId) => {
          handleSelectFile(fileId);
          setIsPromptModalOpen(true);
        }}
        onNewPromptTemplate={handleNewPromptTemplate}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Electron Desktop Exporter Modal */}
      {isElectronModalOpen && (
        <ElectronExportModal
          isOpen={isElectronModalOpen}
          onClose={() => setIsElectronModalOpen(false)}
        />
      )}

      {/* Document Revision History & Snapshots Modal */}
      {activeFile && (
        <VersionHistoryModal
          isOpen={isVersionHistoryOpen}
          onClose={() => setIsVersionHistoryOpen(false)}
          activeFile={activeFile}
          versions={versions}
          onCreateSnapshot={handleCreateSnapshot}
          onRestoreVersion={handleRestoreVersion}
          onDeleteVersion={handleDeleteVersion}
        />
      )}

      {/* Image Insertion Modal */}
      <ImageInsertionModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsertImage={handleInsertSnippet}
      />

      {/* Interactive Markdown Table Generator Modal */}
      <TableGeneratorModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onInsertTable={handleInsertSnippet}
      />

      {/* Command Palette (Ctrl+K / Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        files={files}
        onSelectFile={handleSelectFile}
        onNewFile={handleNewFile}
        onChangeViewMode={setViewMode}
        settings={settings}
        onUpdateSettings={(newS) => setSettings((s) => ({ ...s, ...newS }))}
        onOpenPromptFill={() => setIsPromptModalOpen(true)}
        onOpenPromptHub={() => setIsPromptHubOpen(true)}
        onOpenImageModal={() => setIsImageModalOpen(true)}
        onOpenTableModal={() => setIsTableModalOpen(true)}
      />
    </div>
  );
}
