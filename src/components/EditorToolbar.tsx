import React from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Image as ImageIcon,
  Code,
  Table,
  CheckSquare,
  Quote,
  Columns,
  Edit3,
  Eye,
  Maximize2,
  Copy,
  Download,
  History,
} from 'lucide-react';
import { ViewMode, EditorSettings } from '../types';

interface EditorToolbarProps {
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onFormat: (prefix: string, suffix?: string, defaultText?: string) => void;
  onInsertSnippet: (snippet: string) => void;
  onOpenPromptFill: () => void;
  hasVariables: boolean;
  onCopyRaw: () => void;
  onDownload: () => void;
  onOpenVersionHistory?: () => void;
  onOpenImageModal?: () => void;
  onOpenTableModal?: () => void;
  settings: EditorSettings;
  onUpdateSettings: (newSettings: Partial<EditorSettings>) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  viewMode,
  onChangeViewMode,
  onFormat,
  onInsertSnippet,
  onCopyRaw,
  onDownload,
  onOpenVersionHistory,
  onOpenImageModal,
  onOpenTableModal,
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 select-none text-zinc-700 dark:text-zinc-300">
      {/* Left: View Mode Toggle Tabs */}
      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
        <button
          onClick={() => onChangeViewMode('split')}
          className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
            viewMode === 'split'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
          title="Split View (Editor + Live Preview)"
        >
          <Columns className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Split</span>
        </button>

        <button
          onClick={() => onChangeViewMode('edit')}
          className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
            viewMode === 'edit'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
          title="Editor Only"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Edit</span>
        </button>

        <button
          onClick={() => onChangeViewMode('preview')}
          className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
            viewMode === 'preview'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
          title="Preview Only"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </button>

        <button
          onClick={() => onChangeViewMode('focus')}
          className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
            viewMode === 'focus'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
          title="Reader Focus Mode"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Focus</span>
        </button>
      </div>

      {/* Center: Formatting Shortcut Tools (Active in Edit or Split mode) */}
      {(viewMode === 'split' || viewMode === 'edit') && (
        <div className="flex items-center gap-0.5 border-x border-zinc-200 dark:border-zinc-800 px-2 my-0.5 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => onFormat('**', '**', 'bold text')}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Bold (**text**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onFormat('*', '*', 'italic text')}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Italic (*text*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onFormat('~~', '~~', 'strikethrough')}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Strikethrough (~~text~~)"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />

          <button
            onClick={() => onFormat('# ', '', 'Heading 1')}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onFormat('## ', '', 'Heading 2')}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onFormat('### ', '', 'Heading 3')}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />

          <button
            onClick={() => onFormat('[', '](https://example.com)', 'Link Title')}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Insert Link"
          >
            <Link className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onOpenImageModal && onOpenImageModal()}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            title="Insert Placeholder Image (Unsplash / Picsum API)"
          >
            <ImageIcon className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
          </button>

          <button
            onClick={() => onFormat('```typescript\n', '\n```', '// Your code here')}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Code Block"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              if (onOpenTableModal) {
                onOpenTableModal();
              } else {
                onInsertSnippet(
                  '\n| Header 1 | Header 2 |\n| :--- | :--- |\n| Value 1 | Value 2 |\n'
                );
              }
            }}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Markdown Table Generator (Rows & Columns)"
            aria-label="Open Markdown Table Generator dialog"
          >
            <Table className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onInsertSnippet('\n- [ ] Task item\n')}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Task List Item"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onFormat('> ', '', 'Quote text')}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          {/* Prompt Variable Placeholder Insertion Button */}
          <button
            onClick={() => onFormat('{{', '}}', 'variable_name')}
            className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
            title="Insert Prompt Variable {{var}}"
          >
            <span>{`{{var}}`}</span>
          </button>
        </div>
      )}

      {/* Right: Copy Raw, Font options & Auto-scroll */}
      <div className="flex items-center gap-2">
        {/* Font Style selector */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-xs">
          <button
            onClick={() => onUpdateSettings({ fontStyle: 'sans' })}
            className={`px-1.5 py-0.5 rounded text-[11px] font-sans cursor-pointer ${
              settings.fontStyle === 'sans' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-xs' : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Sans
          </button>
          <button
            onClick={() => onUpdateSettings({ fontStyle: 'serif' })}
            className={`px-1.5 py-0.5 rounded text-[11px] font-serif cursor-pointer ${
              settings.fontStyle === 'serif' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-xs' : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Serif
          </button>
          <button
            onClick={() => onUpdateSettings({ fontStyle: 'mono' })}
            className={`px-1.5 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
              settings.fontStyle === 'mono' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-xs' : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Mono
          </button>
        </div>

        {/* Version History Modal Trigger */}
        {onOpenVersionHistory && (
          <button
            onClick={onOpenVersionHistory}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 text-xs"
            title="Document Revision History & Snapshots"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px] font-mono">History</span>
          </button>
        )}

        {/* Copy Markdown Text */}
        <button
          onClick={onCopyRaw}
          className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
          title="Copy Raw Markdown"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {/* Download File */}
        <button
          onClick={onDownload}
          className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
          title="Download .md File"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
