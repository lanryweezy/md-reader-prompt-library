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

  const lines = content ? content.split('\n') : [''];
  const lineCount = lines.length;

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    if (onScroll) {
      onScroll(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const val = target.value;
      const newText = val.substring(0, start) + '  ' + val.substring(end);
      onChange(newText);

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
      {settings.lineNumbers && (
        <div
          ref={lineNumbersRef}
          className="py-6 px-3 border-r border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950 font-mono tabular-nums text-xs select-none text-right shrink-0 overflow-hidden text-zinc-300 dark:text-zinc-700 leading-relaxed"
          style={{ fontSize: `${settings.fontSize}px` }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-relaxed">
              {i + 1}
            </div>
          ))}
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        placeholder="Start writing..."
        spellCheck="false"
        className={`flex-1 w-full h-full px-6 py-6 md:px-8 bg-transparent resize-none focus:outline-none text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 ${fontClass} leading-relaxed custom-scrollbar selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-zinc-900 dark:selection:text-white`}
        style={{
          fontSize: `${settings.fontSize}px`,
          whiteSpace: settings.wordWrap ? 'pre-wrap' : 'pre',
        }}
      />
    </div>
  );
};
