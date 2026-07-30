import React, { useState } from 'react';
import { Copy, FileText, ArrowUp, Printer, Check } from 'lucide-react';
import { parseMarkdownToHTML } from '../utils/markdownParser';
import { EditorSettings } from '../types';

interface MarkdownPreviewProps {
  content: string;
  settings: EditorSettings;
  previewRef: React.RefObject<HTMLDivElement | null>;
  onContentChange?: (newContent: string) => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  settings,
  previewRef,
  onContentChange,
  onScroll,
}) => {
  const [copyStatus, setCopyStatus] = useState<'raw' | 'text' | null>(null);
  const htmlContent = parseMarkdownToHTML(content);

  // Handle code block "Copy Code" click and task list checkbox clicks inside rendered HTML
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Check for code copy button
    const copyBtn = target.closest('.copy-code-btn');
    if (copyBtn) {
      const encodedCode = copyBtn.getAttribute('data-code');
      if (encodedCode) {
        const code = decodeURIComponent(encodedCode);
        navigator.clipboard.writeText(code);

        const span = copyBtn.querySelector('span');
        if (span) {
          const originalText = span.textContent;
          span.textContent = 'Copied!';
          copyBtn.classList.add('bg-white', 'text-zinc-950');
          setTimeout(() => {
            span.textContent = originalText;
            copyBtn.classList.remove('bg-white', 'text-zinc-950');
          }, 1500);
        }
      }
      return;
    }

    // Check for task list checkboxes
    if (target.tagName === 'INPUT' && target.getAttribute('type') === 'checkbox') {
      const idxStr = target.getAttribute('data-task-index');
      if (idxStr !== null && onContentChange) {
        const idx = parseInt(idxStr, 10);
        let taskCount = 0;

        // Toggle the corresponding - [ ] or - [x] in raw markdown
        const newContent = content.replace(/- \[(x| )\]/gi, (match) => {
          if (taskCount === idx) {
            taskCount++;
            return match.includes('x') || match.includes('X') ? '- [ ]' : '- [x]';
          }
          taskCount++;
          return match;
        });

        onContentChange(newContent);
      }
    }
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(content);
    setCopyStatus('raw');
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const handleCopyPlainText = () => {
    if (previewRef.current) {
      const text = previewRef.current.innerText;
      navigator.clipboard.writeText(text);
      setCopyStatus('text');
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  const handleScrollToTop = () => {
    if (previewRef.current) {
      previewRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const themeClasses =
    settings.theme === 'light'
      ? 'bg-zinc-50 text-zinc-900'
      : 'bg-zinc-950 text-zinc-100';

  const fontClass =
    settings.fontStyle === 'serif'
      ? 'font-serif'
      : settings.fontStyle === 'mono'
      ? 'font-mono'
      : 'font-sans';

  return (
    <div className="relative flex-1 h-full overflow-hidden flex flex-col">
      <div
        ref={previewRef}
        tabIndex={0}
        role="region"
        aria-label="Markdown document preview. Use arrow keys or Page Up/Down to scroll."
        onScroll={onScroll}
        onClick={handleContainerClick}
        className={`flex-1 h-full overflow-y-auto p-6 md:p-8 custom-scrollbar transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 ${themeClasses}`}
      >
        <article
          className={`markdown-body max-w-4xl mx-auto leading-relaxed ${fontClass} ${
            settings.theme === 'light' ? 'theme-light' : 'theme-dark'
          }`}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>

      {/* Floating Micro-Actions Bar (2026 Tactile Control Surface) */}
      <div
        className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5 p-1.5 rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-lg text-xs transition-all hover:shadow-xl"
        role="toolbar"
        aria-label="Preview quick action toolbar"
      >
        <button
          onClick={handleCopyRaw}
          className="px-2.5 py-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
          title="Copy Raw Markdown Content"
          aria-label="Copy raw markdown content to clipboard"
        >
          {copyStatus === 'raw' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span className="font-semibold text-[11px] text-emerald-600 dark:text-emerald-400">Copied MD!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
              <span className="font-medium text-[11px] hidden sm:inline">Copy MD</span>
            </>
          )}
        </button>

        <div className="w-px h-3.5 bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />

        <button
          onClick={handleCopyPlainText}
          className="px-2.5 py-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
          title="Copy Rendered Plain Text"
          aria-label="Copy rendered plain text to clipboard"
        >
          {copyStatus === 'text' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span className="font-semibold text-[11px] text-emerald-600 dark:text-emerald-400">Copied Text!</span>
            </>
          ) : (
            <>
              <FileText className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
              <span className="font-medium text-[11px] hidden sm:inline">Copy Text</span>
            </>
          )}
        </button>

        <div className="w-px h-3.5 bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />

        <button
          onClick={handlePrint}
          className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
          title="Print or Export as PDF"
          aria-label="Print document or save as PDF"
        >
          <Printer className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
        </button>

        <div className="w-px h-3.5 bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />

        <button
          onClick={handleScrollToTop}
          className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
          title="Scroll to Top"
          aria-label="Scroll preview to top"
        >
          <ArrowUp className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
