import React from 'react';
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
  const htmlContent = parseMarkdownToHTML(content);

  // Handle code block "Copy Code" click and task list checkbox clicks inside rendered HTML
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

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

    if (target.tagName === 'INPUT' && target.getAttribute('type') === 'checkbox') {
      const idxStr = target.getAttribute('data-task-index');
      if (idxStr !== null && onContentChange) {
        const idx = parseInt(idxStr, 10);
        let taskCount = 0;

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

  const themeClasses =
    settings.theme === 'light'
      ? 'bg-white text-zinc-900'
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
        aria-label="Markdown document preview"
        onScroll={onScroll}
        onClick={handleContainerClick}
        className={`flex-1 h-full overflow-y-auto px-6 py-8 md:px-10 md:py-10 custom-scrollbar transition-colors focus-visible:outline-none ${themeClasses}`}
      >
        <article
          className={`markdown-body max-w-3xl mx-auto leading-relaxed ${fontClass} ${
            settings.theme === 'light' ? 'theme-light' : 'theme-dark'
          }`}
          style={{ fontSize: `${settings.fontSize}px` }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
};
