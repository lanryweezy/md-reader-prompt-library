import React, { useRef } from 'react';
import { EditorSettings } from '../types';

interface MarkdownEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  settings: EditorSettings;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onScroll?: (e: React.UIEvent<HTMLTextAreaElement>) => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  content,
  onChange,
  settings,
  textareaRef,
  onScroll,
}) => {
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Calculate total line count for gutter
  const lines = content ? content.split('\n') : [''];
  const lineCount = lines.length;

  // Sync line number scrolling with editor scroll
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    if (onScroll) {
      onScroll(e);
    }
  };

  // Keyboard shortcut listener for Tab indent
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      // Insert 2 spaces
      const val = target.value;
      const newText = val.substring(0, start) + '  ' + val.substring(end);
      onChange(newText);

      // Move cursor
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const fontClass =
    settings.fontStyle === 'serif'
      ? 'font-serif'
      : settings.fontStyle === 'mono'
      ? 'font-mono'
      : 'font-sans';

  return (
    <div className="relative flex-1 flex h-full bg-white dark:bg-zinc-950 overflow-hidden text-zinc-900 dark:text-zinc-100">
      {/* Line Numbers */}
      {settings.lineNumbers && (
        <div
          ref={lineNumbersRef}
          className="py-4 px-3 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs select-none text-right shrink-0 overflow-hidden text-zinc-400 dark:text-zinc-600 leading-relaxed"
          style={{ fontSize: `${settings.fontSize}px` }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="h-[1.625rem]">
              {i + 1}
            </div>
          ))}
        </div>
      )}

      {/* Textarea Editor */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        placeholder="Type or paste your Markdown here..."
        spellCheck="false"
        className={`flex-1 w-full h-full p-4 bg-transparent resize-none focus:outline-none text-zinc-800 dark:text-zinc-200 ${fontClass} leading-relaxed custom-scrollbar selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-zinc-900 dark:selection:text-white`}
        style={{
          fontSize: `${settings.fontSize}px`,
          whiteSpace: settings.wordWrap ? 'pre-wrap' : 'pre',
        }}
      />
    </div>
  );
};
