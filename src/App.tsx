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
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { ElectronExportModal } from './components/ElectronExportModal';
import { ImageInsertionModal } from './components/ImageInsertionModal';
import { TableGeneratorModal } from './components/TableGeneratorModal';
import { StatusBar } from './components/StatusBar';
import { LandingPage } from './components/LandingPage';
import { INITIAL_FILES, INITIAL_FOLDERS, LEGACY_MOCK_FILE_IDS } from './data/defaultPrompts';
import {
  MDFile,
  MDFolder,
  EditorSettings,
  ViewMode,
  FileVersion,
  AutoSaveBackup,
  ElectronNativeFile,
  BrowserFileHandle,
  BeforeInstallPromptEvent,
} from './types';
import { extractTableOfContents, extractPromptVariables, getDocumentStats } from './utils/markdownParser';
import { downloadTextFile } from './utils/electronExport';
import {
  AUTOSAVE_INTERVAL_MS,
  getAllAutoSaveBackups,
  saveAutoSaveBackup,
  deleteAutoSaveBackup,
} from './utils/autoSave';
import { UploadCloud } from 'lucide-react';

const WORKSPACE_FILES_KEY = 'md_app_workspace_v2_files';
const WORKSPACE_FOLDERS_KEY = 'md_app_workspace_v2_folders';
const WORKSPACE_VERSIONS_KEY = 'md_app_workspace_v2_versions';

export default function App() {
  // LocalStorage state initialization (clean workspace, preserving any non-mock user files)
  const [files, setFiles] = useState<MDFile[]>(() => {
    try {
      const savedV2 = localStorage.getItem(WORKSPACE_FILES_KEY);
      if (savedV2) return JSON.parse(savedV2);

      const legacySaved = localStorage.getItem('md_app_files');
      if (legacySaved) {
        const parsed = JSON.parse(legacySaved) as MDFile[];
        const userCreated = parsed.filter((f) => !LEGACY_MOCK_FILE_IDS.has(f.id));
        if (userCreated.length > 0) {
          return [...userCreated, ...INITIAL_FILES];
        }
      }
    } catch {
      // Fall back to clean starter prompts
    }
    return INITIAL_FILES;
  });

  const [folders, setFolders] = useState<MDFolder[]>(() => {
    try {
      const savedV2 = localStorage.getItem(WORKSPACE_FOLDERS_KEY);
      if (savedV2) return JSON.parse(savedV2);
    } catch {
      // Fall back to clean starter folder
    }
    return INITIAL_FOLDERS;
  });

  const [currentFileId, setCurrentFileId] = useState<string>(() => {
    return files.length > 0 ? files[0].id : '';
  });

  const [openFileIds, setOpenFileIds] = useState<string[]>(() => {
    return files.length > 0 ? [files[0].id] : [];
  });

  const isElectronRuntime = Boolean(
    typeof window !== 'undefined' && window.electronAPI?.isElectron
  );
  const isStandaloneOrFileLaunch = Boolean(
    typeof window !== 'undefined' &&
      (window.matchMedia?.('(display-mode: standalone)').matches ||
        window.location.search.includes('source=app') ||
        window.location.search.includes('source=file-handler'))
  );
  const [activeSurface, setActiveSurface] = useState<'landing' | 'editor'>(() =>
    isElectronRuntime || isStandaloneOrFileLaunch ? 'editor' : 'landing'
  );
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const browserFileHandlesRef = useRef<Map<string, BrowserFileHandle>>(new Map());

  const [activeTab, setActiveTab] = useState<'files' | 'prompts' | 'toc'>('files');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isPromptHubOpen, setIsPromptHubOpen] = useState(false);
  const [isElectronModalOpen, setIsElectronModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => {
      setNotice((prev) => (prev === message ? null : prev));
    }, 3500);
  };

  // Version snapshots state (starts empty; only real user snapshots are stored)
  const [versions, setVersions] = useState<FileVersion[]>(() => {
    try {
      const saved = localStorage.getItem(WORKSPACE_VERSIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(WORKSPACE_VERSIONS_KEY, JSON.stringify(versions));
  }, [versions]);

  const [settings, setSettings] = useState<EditorSettings>(() => {
    const defaults: EditorSettings = {
      theme: 'dark',
      accentColor: 'slate',
      fontStyle: 'sans',
      fontSize: 15,
      wordWrap: true,
      lineNumbers: true,
      autoSave: true,
      syncScroll: true,
    };
    const saved = localStorage.getItem('md_app_settings');
    if (!saved) return defaults;
    try {
      return { ...defaults, ...JSON.parse(saved) };
    } catch {
      return defaults;
    }
  });

  // 30-second localStorage auto-save backups state
  const [autoSaveBackups, setAutoSaveBackups] = useState<Record<string, AutoSaveBackup>>(() =>
    getAllAutoSaveBackups()
  );
  const [justAutoSaved, setJustAutoSaved] = useState(false);
  const autoSaveFeedbackTimerRef = useRef<number | null>(null);

  // Editor and preview scroll refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  // Active file object & ref (keeps latest content accessible to 30s interval without resetting timer on keystrokes)
  const activeFile = files.find((f) => f.id === currentFileId) || files[0];
  const activeFileRef = useRef<MDFile | undefined>(activeFile);
  activeFileRef.current = activeFile;

  const activeAutoSaveBackup = activeFile ? autoSaveBackups[activeFile.id] || null : null;
  const hasRecoverableAutoSave = Boolean(
    activeFile && activeAutoSaveBackup && activeAutoSaveBackup.content !== activeFile.content
  );

  // Select file handler ensuring file is in open tabs
  const handleSelectFile = (id: string) => {
    setCurrentFileId(id);
    setOpenFileIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  // Open a .md file passed from OS double-click (Electron IPC or Browser File Handling API)
  const openExternalFileInWorkspace = (
    nativeFile: ElectronNativeFile,
    browserHandle?: BrowserFileHandle
  ) => {
    setActiveSurface('editor');
    setFiles((prev) => {
      const existing = prev.find((f) => f.path === nativeFile.path);
      if (existing) {
        if (browserHandle) {
          browserFileHandlesRef.current.set(existing.id, browserHandle);
        }
        setCurrentFileId(existing.id);
        setOpenFileIds((openPrev) =>
          openPrev.includes(existing.id) ? openPrev : [...openPrev, existing.id]
        );
        return prev.map((f) =>
          f.id === existing.id
            ? { ...f, content: nativeFile.content, updatedAt: Date.now() }
            : f
        );
      }

      const newId = `os-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      if (browserHandle) {
        browserFileHandlesRef.current.set(newId, browserHandle);
      }
      const newFile: MDFile = {
        id: newId,
        name: nativeFile.name,
        path: nativeFile.path,
        content: nativeFile.content,
        tags: ['local'],
        isPrompt:
          nativeFile.name.includes('prompt') ||
          /\{\{([a-zA-Z0-9_-]+)\}\}/.test(nativeFile.content),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setCurrentFileId(newId);
      setOpenFileIds((openPrev) => [...openPrev, newId]);
      return [newFile, ...prev];
    });
    showNotice(`Opened ${nativeFile.name}`);
  };

  // Listen for OS-launched .md files (Electron IPC & Browser LaunchQueue) and install prompt
  useEffect(() => {
    let unsubscribeElectron: (() => void) | undefined;

    if (window.electronAPI?.getPendingFiles) {
      window.electronAPI.getPendingFiles().then((pending) => {
        if (pending && pending.length > 0) {
          pending.forEach((nf) => openExternalFileInWorkspace(nf));
        }
      });
    }

    if (window.electronAPI?.onFileOpenedFromOS) {
      unsubscribeElectron = window.electronAPI.onFileOpenedFromOS((nf) => {
        openExternalFileInWorkspace(nf);
      });
    }

    if (window.launchQueue?.setConsumer) {
      window.launchQueue.setConsumer(async (launchParams) => {
        if (!launchParams.files || launchParams.files.length === 0) return;
        for (const handle of launchParams.files) {
          try {
            const file = await handle.getFile();
            const text = await file.text();
            openExternalFileInWorkspace(
              {
                path: `/${file.name}`,
                name: file.name,
                content: text,
              },
              handle
            );
          } catch (err) {
            console.error('Failed to read launched file handle:', err);
          }
        }
      });
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      unsubscribeElectron?.();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallBrowserApp = async () => {
    if (!installPromptEvent) return;
    await installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPromptEvent(null);
      showNotice('MD Reader installed. You can now open .md files directly with it.');
    }
  };

  const handleSetDefaultMdApp = async () => {
    if (window.electronAPI?.openDefaultAppsSettings) {
      const result = await window.electronAPI.openDefaultAppsSettings();
      if (result?.message) {
        showNotice(result.message);
      }
      return;
    }
    setIsElectronModalOpen(true);
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
    localStorage.setItem(WORKSPACE_FILES_KEY, JSON.stringify(files));
    if (files.length > 0 && !files.some((f) => f.id === currentFileId)) {
      setCurrentFileId(files[0].id);
    } else if (files.length === 0 && currentFileId !== '') {
      setCurrentFileId('');
    }
  }, [files, currentFileId]);

  useEffect(() => {
    localStorage.setItem(WORKSPACE_FOLDERS_KEY, JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('md_app_settings', JSON.stringify(settings));
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Save a backup copy of a file to localStorage and show brief confirmation feedback
  const performAutoSaveBackup = (targetFile?: MDFile) => {
    const fileToSave = targetFile || activeFileRef.current;
    if (!fileToSave) return;

    const saved = saveAutoSaveBackup(fileToSave);
    if (saved) {
      setAutoSaveBackups((prev) => ({ ...prev, [saved.fileId]: saved }));
      setJustAutoSaved(true);
      if (autoSaveFeedbackTimerRef.current !== null) {
        window.clearTimeout(autoSaveFeedbackTimerRef.current);
      }
      autoSaveFeedbackTimerRef.current = window.setTimeout(() => {
        setJustAutoSaved(false);
      }, 2000);
    }
  };

  // Automatic 30-second localStorage backup loop for the active file
  useEffect(() => {
    if (!settings.autoSave || !activeFile?.id) return;

    const intervalId = window.setInterval(() => {
      if (activeFileRef.current) {
        performAutoSaveBackup(activeFileRef.current);
      }
    }, AUTOSAVE_INTERVAL_MS);

    const handleBeforeUnload = () => {
      if (activeFileRef.current) {
        saveAutoSaveBackup(activeFileRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [settings.autoSave, activeFile?.id]);

  useEffect(() => {
    return () => {
      if (autoSaveFeedbackTimerRef.current !== null) {
        window.clearTimeout(autoSaveFeedbackTimerRef.current);
      }
    };
  }, []);

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

  // Restore the latest 30s localStorage auto-save backup for the active file
  const handleRestoreAutoSave = () => {
    if (!activeFile || !activeAutoSaveBackup) return;
    handleCreateSnapshot(activeFile.id, 'Pre-AutoSave Restore');
    handleContentChange(activeAutoSaveBackup.content);
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
  const handleNewFile = (folderId?: string, customName?: string) => {
    const fileNum = files.length + 1;
    const rawName = customName?.trim() || `untitled-${fileNum}.md`;
    const fileName = /\.(md|markdown|txt)$/i.test(rawName) ? rawName : `${rawName}.md`;
    const parentFolder = folderId ? folders.find((f) => f.id === folderId) : undefined;
    const titleFromName = fileName.replace(/\.(md|markdown|txt)$/i, '').replace(/[-_]+/g, ' ');

    const newFile: MDFile = {
      id: `file-${Date.now()}`,
      name: fileName,
      path: parentFolder ? `/${parentFolder.name}/${fileName}` : `/${fileName}`,
      folderId,
      content: `# ${titleFromName}\n\n`,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setFiles((prev) => [newFile, ...prev]);
    handleSelectFile(newFile.id);
  };

  const handleNewFolder = (folderName: string) => {
    const trimmed = folderName.trim();
    if (!trimmed) return;

    const newFolder: MDFolder = {
      id: `f-${Date.now()}`,
      name: trimmed,
      icon: 'folder',
    };

    setFolders((prev) => [...prev, newFolder]);
    return newFolder.id;
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId && f.parentId !== folderId));
    setFiles((prev) =>
      prev.map((f) =>
        f.folderId === folderId
          ? { ...f, folderId: undefined, path: `/${f.name}` }
          : f
      )
    );
  };

  const handleRenameFile = (fileId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const finalName = /\.(md|markdown|txt)$/i.test(trimmed) ? trimmed : `${trimmed}.md`;

    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== fileId) return f;
        const folder = f.folderId ? folders.find((fld) => fld.id === f.folderId) : undefined;
        return {
          ...f,
          name: finalName,
          path: folder ? `/${folder.name}/${finalName}` : `/${finalName}`,
          updatedAt: Date.now(),
        };
      })
    );
  };

  const handleNewPromptTemplate = (title?: string, tags?: string[]) => {
    const promptNum = files.filter((f) => f.isPrompt).length + 1;
    const cleanTitle = title?.trim() || `Prompt ${promptNum}`;
    const slug =
      cleanTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `prompt-${promptNum}`;
    const fileName = `${slug}.md`;

    // Ensure a Prompts folder exists if present
    const promptsFolder = folders.find((f) => f.id === 'f-prompts');
    const folderId = promptsFolder ? promptsFolder.id : undefined;

    const newPrompt: MDFile = {
      id: `prompt-${Date.now()}`,
      name: fileName,
      path: promptsFolder ? `/${promptsFolder.name}/${fileName}` : `/${fileName}`,
      folderId,
      tags: tags && tags.length > 0 ? tags : ['prompt'],
      isPrompt: true,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content: `# ${cleanTitle}

## Context
{{context}}

## Instructions
1. {{instruction}}
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
    const remaining = files.filter((f) => f.id !== fileId);
    setFiles(remaining);
    setOpenFileIds((prev) => prev.filter((id) => id !== fileId));
    deleteAutoSaveBackup(fileId);
    setAutoSaveBackups((prev) => {
      const next = { ...prev };
      delete next[fileId];
      return next;
    });
    if (currentFileId === fileId) {
      setCurrentFileId(remaining.length > 0 ? remaining[0].id : '');
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
        handleSelectFile(newFile.id);
      };
      reader.readAsText(file);
    });
  };

  // Save active file (native Electron disk save, browser FileHandle write, or browser .md download)
  const handleSaveActiveFile = async () => {
    if (!activeFile) return;

    if (window.electronAPI?.saveFile) {
      const result = await window.electronAPI.saveFile({
        filePath: activeFile.path,
        defaultName: activeFile.name,
        content: activeFile.content,
      });
      if (result?.success) {
        if (result.path && result.name) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === activeFile.id ? { ...f, name: result.name!, path: result.path! } : f
            )
          );
        }
        showNotice(`Saved ${result.name || activeFile.name} to disk.`);
      }
      return;
    }

    const browserHandle = browserFileHandlesRef.current.get(activeFile.id);
    if (browserHandle?.createWritable) {
      try {
        const writable = await browserHandle.createWritable();
        await writable.write(activeFile.content);
        await writable.close();
        showNotice(`Saved ${activeFile.name} to disk.`);
        return;
      } catch (err) {
        console.warn('Direct file handle write unavailable, falling back to download:', err);
      }
    }

    downloadTextFile(activeFile.name, activeFile.content);
  };

  // Open files (native Electron dialog or browser file input)
  const handleOpenFilesAction = async () => {
    if (window.electronAPI?.openFiles) {
      const nativeFiles = await window.electronAPI.openFiles();
      if (nativeFiles && nativeFiles.length > 0) {
        const imported: MDFile[] = nativeFiles.map((nf) => ({
          id: `native-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: nf.name,
          path: nf.path,
          content: nf.content,
          tags: ['local'],
          isPrompt: nf.name.includes('prompt') || /\{\{([a-zA-Z0-9_-]+)\}\}/.test(nf.content),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }));
        setFiles((prev) => [...imported, ...prev]);
        handleSelectFile(imported[0].id);
      }
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown,.txt';
    input.multiple = true;
    input.onchange = (e) => handleImportFiles(e as any);
    input.click();
  };

  // HTML5 Directory Picker API or Native Electron Folder Picker
  const handleImportDirectory = async () => {
    if (window.electronAPI?.openFolder) {
      const result = await window.electronAPI.openFolder();
      if (result && result.files.length > 0) {
        const folderId = `f-${Date.now()}`;
        const newFolder: MDFolder = {
          id: folderId,
          name: result.folderName,
          icon: 'folder',
        };
        const imported: MDFile[] = result.files.map((nf) => ({
          id: `native-dir-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: nf.name,
          path: nf.path,
          folderId,
          content: nf.content,
          tags: ['local'],
          isPrompt: /\{\{([a-zA-Z0-9_-]+)\}\}/.test(nf.content),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }));
        setFolders((prev) => [...prev, newFolder]);
        setFiles((prev) => [...imported, ...prev]);
        handleSelectFile(imported[0].id);
        showNotice(`Opened ${imported.length} Markdown files from ${result.folderName}.`);
      } else if (result) {
        showNotice('No .md files found in the selected folder.');
      }
      return;
    }

    if ('showDirectoryPicker' in window) {
      try {
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker();
        const importedFiles: MDFile[] = [];

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
                tags: ['imported'],
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
          handleSelectFile(importedFiles[0].id);
        } else {
          showNotice('No .md files found in the selected directory.');
        }
      } catch (err) {
        console.log('Directory selection canceled or unavailable:', err);
      }
    } else {
      showNotice('Folder picker is unavailable here — drag and drop .md files directly into the window.');
    }
  };

  // Keyboard shortcuts listener (active only inside the workspace editor)
  useEffect(() => {
    if (activeSurface !== 'editor' && !isElectronRuntime) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveActiveFile();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleNewFile();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
        e.preventDefault();
        handleOpenFilesAction();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSurface, isElectronRuntime, activeFile]);

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

  // Web Landing Page (automatically bypassed when launched natively inside Electron)
  if (activeSurface === 'landing' && !isElectronRuntime) {
    return (
      <div className={settings.theme === 'dark' ? 'dark' : ''}>
        <LandingPage
          settings={settings}
          onUpdateSettings={(newS) => setSettings((s) => ({ ...s, ...newS }))}
          onLaunchWebApp={() => setActiveSurface('editor')}
          onOpenElectronModal={() => setIsElectronModalOpen(true)}
          canInstallBrowserApp={Boolean(installPromptEvent)}
          onInstallBrowserApp={handleInstallBrowserApp}
        />
        {isElectronModalOpen && (
          <ElectronExportModal
            isOpen={isElectronModalOpen}
            onClose={() => setIsElectronModalOpen(false)}
          />
        )}
      </div>
    );
  }

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
        settings={settings}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        onUpdateSettings={(newS) => setSettings((s) => ({ ...s, ...newS }))}
        onNewFile={() => handleNewFile()}
        onOpenFile={handleOpenFilesAction}
        onOpenFolder={handleImportDirectory}
        onSaveFile={handleSaveActiveFile}
        onDuplicateFile={handleDuplicatePrompt}
        onPrint={() => window.print()}
        onOpenPromptFill={() => setIsPromptModalOpen(true)}
        variableCount={promptVariables.length}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
        lastAutoSave={activeAutoSaveBackup}
        hasRecoverableAutoSave={hasRecoverableAutoSave}
        onSaveBackupNow={() => performAutoSaveBackup()}
        onRestoreAutoSave={handleRestoreAutoSave}
        onGoHome={() => setActiveSurface('landing')}
        onOpenDesktopModal={() => setIsElectronModalOpen(true)}
        onSetDefaultMdApp={handleSetDefaultMdApp}
        isElectron={isElectronRuntime}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Sidebar (Hidden in Focus mode) */}
        {viewMode !== 'focus' && isSidebarOpen && (
          <Sidebar
            files={files}
            folders={folders}
            currentFileId={currentFileId}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            toc={toc}
            onSelectFile={handleSelectFile}
            onNewFile={handleNewFile}
            onNewFolder={handleNewFolder}
            onDeleteFolder={handleDeleteFolder}
            onRenameFile={handleRenameFile}
            onDeleteFile={handleDeleteFile}
            onToggleFavorite={handleToggleFavorite}
            onOpenPromptLibraryHub={() => setIsPromptHubOpen(true)}
            onNewPromptTemplate={handleNewPromptTemplate}
          />
        )}

        {/* Center Content: Editor & Preview */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-950">
          {/* Open Tabs Bar (Hidden in Focus mode) */}
          {viewMode !== 'focus' && (
            <EditorTabBar
              openFileIds={openFileIds}
              files={files}
              currentFileId={currentFileId}
              onSelectFile={handleSelectFile}
              onCloseTab={handleCloseTab}
              onNewFile={handleNewFile}
            />
          )}

          {activeFile ? (
            <>
              {/* Formatting Toolbar (Auto-hidden in Preview & Focus modes) */}
              <EditorToolbar
                viewMode={viewMode}
                onFormat={handleFormat}
                onInsertSnippet={handleInsertSnippet}
                onCopyRaw={() => navigator.clipboard.writeText(activeFile.content)}
                onDownload={handleSaveActiveFile}
                onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
                onOpenImageModal={() => setIsImageModalOpen(true)}
                onOpenTableModal={() => setIsTableModalOpen(true)}
                settings={settings}
                onUpdateSettings={(newS) => setSettings((s) => ({ ...s, ...newS }))}
              />

              {/* View Container based on ViewMode */}
              <div className="flex-1 flex overflow-hidden relative">
                {/* Editor View (Shown in 'split' or 'edit') */}
                {(viewMode === 'split' || viewMode === 'edit') && (
                  <div
                    className={`flex-1 flex flex-col h-full ${
                      viewMode === 'split' ? 'border-r border-zinc-200 dark:border-zinc-800/80' : ''
                    }`}
                  >
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
                      viewMode === 'focus' ? 'max-w-4xl mx-auto' : ''
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
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 text-sm gap-3">
              <p>No document open.</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNewFile()}
                  className="px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium cursor-pointer"
                >
                  New File
                </button>
                <button
                  onClick={() => handleNewPromptTemplate()}
                  className="px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-medium cursor-pointer"
                >
                  New Prompt
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Subtle Non-Blocking Notice Toast */}
      {notice && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-3.5 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs shadow-lg">
          {notice}
        </div>
      )}

      {/* Bottom Status Bar */}
      {activeFile && viewMode !== 'focus' && (
        <StatusBar
          content={activeFile.content}
          settings={settings}
          onUpdateSettings={(newS) => setSettings((s) => ({ ...s, ...newS }))}
          lastAutoSave={activeAutoSaveBackup}
          justAutoSaved={justAutoSaved}
          onRestoreAutoSave={handleRestoreAutoSave}
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
        onSelectPrompt={handleSelectFile}
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
          autoSaveBackup={activeAutoSaveBackup}
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
