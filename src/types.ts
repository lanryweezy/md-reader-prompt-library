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
