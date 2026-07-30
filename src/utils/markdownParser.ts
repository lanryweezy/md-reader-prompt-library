import { marked } from 'marked';
import hljs from 'highlight.js';
import { PromptVariable, TOCItem } from '../types';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Parses markdown string to HTML with syntax highlighting, callout banners, and custom styling
 */
export function parseMarkdownToHTML(markdown: string): string {
  if (!markdown) return '';

  try {
    // Custom pre-processing for Callout Admonitions (> [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT])
    let processed = processCallouts(markdown);

    // Parse markdown to HTML using marked
    let rawHtml = marked.parse(processed) as string;

    // Post-process HTML for highlight.js syntax highlighting and code copy buttons
    let finalHtml = postProcessHtml(rawHtml);

    return finalHtml;
  } catch (err) {
    console.error('Markdown parse error:', err);
    return `<div class="p-4 bg-red-500/10 text-red-500 rounded-lg">Error rendering markdown: ${String(err)}</div>`;
  }
}

/**
 * Transforms Markdown callout blocks into beautiful styled HTML banners
 */
function processCallouts(md: string): string {
  // Regex to match callout block quotes: > [!NOTE] or > [!TIP] etc.
  const calloutRegex = /^>\s*\[\!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*$(?:\n^>.*$)*/gim;

  return md.replace(calloutRegex, (match) => {
    const lines = match.split('\n');
    const firstLine = lines[0];
    const typeMatch = firstLine.match(/\[\!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/i);
    const type = typeMatch ? typeMatch[1].toUpperCase() : 'NOTE';

    const contentLines = lines
      .slice(1)
      .map((line) => line.replace(/^>\s?/, ''))
      .join('\n');

    let icon = 'ℹ️';
    let label = 'Note';

    if (type === 'TIP') {
      icon = '💡';
      label = 'Tip';
    } else if (type === 'WARNING') {
      icon = '⚠️';
      label = 'Warning';
    } else if (type === 'CAUTION') {
      icon = '🚨';
      label = 'Caution';
    } else if (type === 'IMPORTANT') {
      icon = '📌';
      label = 'Important';
    }

    const typeClass = `callout-${type.toLowerCase()}`;

    return `<div class="callout-block ${typeClass} my-4 p-4 rounded-xl border transition-all" role="note" aria-label="${label}: ${contentLines.slice(0, 50).replace(/"/g, '&quot;')}">
      <div class="flex items-center gap-2 font-semibold mb-1 text-sm tracking-wide uppercase callout-header">
        <span aria-hidden="true">${icon}</span>
        <span>${label}</span>
      </div>
      <div class="text-sm leading-relaxed callout-body">
        ${contentLines}
      </div>
    </div>`;
  });
}

/**
 * Post-processes HTML string to apply highlight.js highlighting to <pre><code> tags and add copy code buttons
 */
function postProcessHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Post-process HTML: Add IDs to headings for Table of Contents navigation
  const headings = doc.querySelectorAll('h1, h2, h3, h4');
  headings.forEach((heading) => {
    const text = heading.textContent || '';
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    heading.setAttribute('id', id);
  });

  // Syntax highlighting for code blocks
  const codeBlocks = doc.querySelectorAll('pre code');
  codeBlocks.forEach((codeEl) => {
    const pre = codeEl.parentElement;
    if (!pre) return;

    // Get language class if present
    const className = codeEl.className || '';
    const langMatch = className.match(/language-(\w+)/);
    const lang = langMatch ? langMatch[1] : '';

    let highlightedCode = codeEl.textContent || '';
    if (lang && hljs.getLanguage(lang)) {
      try {
        highlightedCode = hljs.highlight(highlightedCode, { language: lang }).value;
      } catch (e) {
        // Fallback to auto highlight
        highlightedCode = hljs.highlightAuto(highlightedCode).value;
      }
    } else if (highlightedCode) {
      try {
        highlightedCode = hljs.highlightAuto(highlightedCode).value;
      } catch (e) {
        // Keep unhighlighted
      }
    }

    codeEl.innerHTML = highlightedCode;
    codeEl.classList.add('hljs');

    // Add wrapper with language header and Copy button
    pre.classList.add('code-block-pre', 'relative', 'group', 'rounded-xl', 'overflow-hidden', 'my-4', 'border');
    
    // Create header container for code block
    const header = doc.createElement('div');
    header.className = 'code-block-header flex items-center justify-between px-4 py-2 text-xs font-mono select-none border-b';
    header.innerHTML = `
      <span class="flex items-center gap-1.5 font-medium uppercase tracking-wider text-[11px] code-block-lang">
        <span class="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500" aria-hidden="true"></span>
        ${lang || 'text'}
      </span>
      <button 
        type="button" 
        class="copy-code-btn px-2.5 py-1 rounded transition-colors cursor-pointer text-xs flex items-center gap-1 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
        data-code="${encodeURIComponent(codeEl.textContent || '')}"
        aria-label="Copy ${lang || 'code'} snippet to clipboard"
      >
        <span>Copy</span>
      </button>
    `;

    pre.parentNode?.insertBefore(header, pre);
  });

  // Target checkboxes in task lists for interactivity
  const checkboxes = doc.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((cb, idx) => {
    const liText = cb.parentElement?.textContent?.trim() || `Task item ${idx + 1}`;
    cb.classList.add('mr-2', 'rounded', 'h-4', 'w-4', 'cursor-pointer', 'focus-visible:ring-2', 'focus-visible:ring-zinc-900', 'dark:focus-visible:ring-zinc-100');
    cb.setAttribute('data-task-index', String(idx));
    cb.setAttribute('aria-label', `Toggle completion for: ${liText}`);
  });

  return doc.body.innerHTML;
}

/**
 * Extracts prompt variables enclosed in {{variable_name}}
 */
export function extractPromptVariables(content: string): PromptVariable[] {
  if (!content) return [];
  const regex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
  const variablesSet = new Set<string>();
  let match;

  while ((match = regex.exec(content)) !== null) {
    variablesSet.add(match[1]);
  }

  return Array.from(variablesSet).map((name) => ({
    name,
    defaultValue: '',
    description: `Value for {{${name}}}`,
  }));
}

/**
 * Replaces prompt variables in string with user provided map
 */
export function fillPromptVariables(content: string, values: Record<string, string>): string {
  return content.replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, (_, key) => {
    return values[key] !== undefined && values[key] !== '' ? values[key] : `{{${key}}}`;
  });
}

/**
 * Extracts Table of Contents from markdown string (Headings 1-4)
 */
export function extractTableOfContents(content: string): TOCItem[] {
  if (!content) return [];
  const headingRegex = /^(#{1,4})\s+(.+)$/gm;
  const toc: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].replace(/[*_~`]/g, '').trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    toc.push({ id, text, level });
  }

  return toc;
}

/**
 * Calculates document word count, character count, estimated reading time, speaking time, and readability score
 */
export function getDocumentStats(content: string) {
  if (!content) {
    return {
      words: 0,
      chars: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
      lines: 0,
      readabilityGrade: 'N/A',
      readabilityScore: 100,
    };
  }

  const lines = content.split('\n').length;
  const chars = content.length;
  const sentences = (content.match(/[.!?]+(\s|$)/g) || []).length || 1;
  const wordsArray = content.trim() ? content.trim().split(/\s+/) : [];
  const words = wordsArray.length;

  // Approximate syllable count
  let syllables = 0;
  wordsArray.forEach((w) => {
    const word = w.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) {
      syllables += 1;
    } else {
      const match = word.match(/[aeiouy]{1,2}/g);
      syllables += match ? match.length : 1;
    }
  });

  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
  const speakingTimeMinutes = Math.max(1, Math.ceil(words / 130));

  // Flesch Reading Ease score: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  let readabilityScore = 100;
  let readabilityGrade = 'Easy';

  if (words > 10) {
    const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    readabilityScore = Math.max(0, Math.min(100, Math.round(score)));

    if (readabilityScore >= 80) readabilityGrade = 'Easy / Casual';
    else if (readabilityScore >= 60) readabilityGrade = 'Standard / Clear';
    else if (readabilityScore >= 40) readabilityGrade = 'Academic / Dense';
    else readabilityGrade = 'Technical / Complex';
  }

  return {
    words,
    chars,
    readingTimeMinutes,
    speakingTimeMinutes,
    lines,
    readabilityGrade,
    readabilityScore,
  };
}
