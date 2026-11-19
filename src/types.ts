export type ViewMode = 'split' | 'edit' | 'preview' | 'focus';

export type FontStyle = 'sans' | 'serif' | 'mono';

export interface FileVersion {
  id: string;
  fileId: string;
  timestamp: number;
  label: string;
  content: string;
  wordCount: number;
}

export interface AutoSaveBackup {
  fileId: string;
  fileName: string;
  filePath: string;
  content: string;
  savedAt: number;
  wordCount: number;
}

export interface MDFile {
  id: string;
  name: string; // e.g. "code-review-prompt.md"
  path: string; // e.g. "/prompts/coding/code-review-prompt.md"
  content: string;
  folderId?: string;
  tags: string[];
  isPrompt?: boolean;
  isFavorite?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface MDFolder {
  id: string;
  name: string;
  parentId?: string;
  icon?: string;
}

export interface PromptVariable {
  name: string;
  defaultValue?: string;
  description?: string;
}

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export interface EditorSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';
  fontStyle: FontStyle;
  fontSize: number; // in px, default 15
  wordWrap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  syncScroll: boolean;
}

export interface ElectronNativeFile {
  path: string;
  name: string;
  content: string;
}

export interface DefaultAppsResult {
  openedSettings: boolean;
  platform: string;
  message: string;
}

export interface ElectronAPI {
  isElectron: boolean;
  platform: string;
  openFiles: () => Promise<ElectronNativeFile[] | null>;
  openFolder: () => Promise<{
    folderPath: string;
    folderName: string;
    files: ElectronNativeFile[];
  } | null>;
  saveFile: (payload: {
    filePath?: string;
    defaultName?: string;
    content: string;
  }) => Promise<{ success: boolean; path?: string; name?: string }>;
  getPendingFiles?: () => Promise<ElectronNativeFile[]>;
  onFileOpenedFromOS?: (callback: (file: ElectronNativeFile) => void) => () => void;
  openDefaultAppsSettings?: () => Promise<DefaultAppsResult>;
}

export interface BrowserFileHandle {
  name: string;
  getFile: () => Promise<File>;
  createWritable?: () => Promise<{
    write: (data: string) => Promise<void>;
    close: () => Promise<void>;
  }>;
}

export interface LaunchParams {
  files?: BrowserFileHandle[];
}

export interface LaunchQueue {
  setConsumer: (consumer: (launchParams: LaunchParams) => void | Promise<void>) => void;
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    launchQueue?: LaunchQueue;
  }
}
