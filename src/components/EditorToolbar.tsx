import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Link,
  Image as ImageIcon,
  Code,
  Table,
  CheckSquare,
  Quote,
  Copy,
  Check,
  Download,
  History,
  Type,
  Minus,
  Plus,
} from 'lucide-react';
import { ViewMode, EditorSettings } from '../types';

interface EditorToolbarProps {
  viewMode: ViewMode;
  onFormat: (prefix: string, suffix?: string, defaultText?: string) => void;
  onInsertSnippet: (snippet: string) => void;
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
  const [copied, setCopied] = useState(false);
  const [isTypographyOpen, setIsTypographyOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTypographyOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsTypographyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTypographyOpen]);

  // Hide formatting bar completely in Preview and Focus reading modes
  if (viewMode === 'preview' || viewMode === 'focus') {
    return null;
  }

  const handleCopy = () => {
    onCopyRaw();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const iconBtnClass =
    'p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer';

  return (
    <div className="h-9 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800/80 px-3 flex items-center justify-between gap-2 select-none shrink-0">
      {/* Left: Quiet Formatting Actions */}
      <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onFormat('**', '**', 'bold text')}
          className={iconBtnClass}
          title="Bold"
          aria-label="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onFormat('*', '*', 'italic text')}
          className={iconBtnClass}
          title="Italic"
          aria-label="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onFormat('~~', '~~', 'strikethrough')}
          className={iconBtnClass}
          title="Strikethrough"
          aria-label="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3.5 bg-zinc-200 dark:bg-zinc-800 mx-1.5" aria-hidden="true" />

        <button
          onClick={() => onFormat('# ', '', 'Heading 1')}
          className={iconBtnClass}
          title="Heading 1"
          aria-label="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onFormat('## ', '', 'Heading 2')}
          className={iconBtnClass}
          title="Heading 2"
          aria-label="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3.5 bg-zinc-200 dark:bg-zinc-800 mx-1.5" aria-hidden="true" />

        <button
          onClick={() => onFormat('[', '](https://example.com)', 'Link')}
          className={iconBtnClass}
          title="Insert link"
          aria-label="Insert link"
        >
          <Link className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onOpenImageModal && onOpenImageModal()}
          className={iconBtnClass}
          title="Insert image"
          aria-label="Insert image"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onFormat('```typescript\n', '\n```', '// code')}
          className={iconBtnClass}
          title="Code block"
          aria-label="Code block"
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => {
            if (onOpenTableModal) {
              onOpenTableModal();
            } else {
              onInsertSnippet('\n| Header 1 | Header 2 |\n| :--- | :--- |\n| Value 1 | Value 2 |\n');
            }
          }}
          className={iconBtnClass}
          title="Insert table"
          aria-label="Insert table"
        >
          <Table className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onInsertSnippet('\n- [ ] Task item\n')}
          className={iconBtnClass}
          title="Checklist item"
          aria-label="Checklist item"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onFormat('> ', '', 'Quote')}
          className={iconBtnClass}
          title="Blockquote"
          aria-label="Blockquote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onFormat('{{', '}}', 'variable')}
          className="px-1.5 py-1 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-[11px] font-mono transition-colors cursor-pointer"
          title="Insert prompt variable"
        >
          {`{{}}`}
        </button>
      </div>

      {/* Right: Typography Popover + Quiet Document Actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setIsTypographyOpen((open) => !open)}
            className={`${iconBtnClass} ${
              isTypographyOpen ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100' : ''
            }`}
            title="Typography & editor preferences"
            aria-label="Typography settings"
          >
            <Type className="w-3.5 h-3.5" />
          </button>

          {isTypographyOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg p-3 z-40 space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
              {/* Font family */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">Font</span>
                <div className="grid grid-cols-3 gap-1 bg-zinc-100 dark:bg-zinc-950 p-0.5 rounded-md">
                  {(['sans', 'serif', 'mono'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => onUpdateSettings({ fontStyle: style })}
                      className={`py-1 rounded text-[11px] capitalize cursor-pointer transition-colors ${
                        settings.fontStyle === style
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium shadow-2xs'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">Size</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onUpdateSettings({ fontSize: Math.max(12, settings.fontSize - 1) })}
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                    aria-label="Decrease font size"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono tabular-nums text-[11px] w-8 text-center text-zinc-900 dark:text-zinc-100">
                    {settings.fontSize}px
                  </span>
                  <button
                    onClick={() => onUpdateSettings({ fontSize: Math.min(24, settings.fontSize + 1) })}
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                    aria-label="Increase font size"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2 space-y-1.5">
                <button
                  onClick={() => onUpdateSettings({ lineNumbers: !settings.lineNumbers })}
                  className="w-full flex items-center justify-between py-0.5 text-xs hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                >
                  <span>Line numbers</span>
                  <span className="font-mono text-[10px] text-zinc-400">
                    {settings.lineNumbers ? 'ON' : 'OFF'}
                  </span>
                </button>
                <button
                  onClick={() => onUpdateSettings({ wordWrap: !settings.wordWrap })}
                  className="w-full flex items-center justify-between py-0.5 text-xs hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                >
                  <span>Word wrap</span>
                  <span className="font-mono text-[10px] text-zinc-400">
                    {settings.wordWrap ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {onOpenVersionHistory && (
          <button
            onClick={onOpenVersionHistory}
            className={iconBtnClass}
            title="Revision history"
            aria-label="Revision history"
          >
            <History className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={handleCopy}
          className={iconBtnClass}
          title={copied ? 'Copied markdown' : 'Copy markdown'}
          aria-label="Copy markdown"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          onClick={onDownload}
          className={iconBtnClass}
          title="Download .md"
          aria-label="Download markdown file"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
