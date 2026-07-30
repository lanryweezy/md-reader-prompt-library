import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  X,
  Code,
  PenTool,
  Briefcase,
  Wand2,
  Star,
  Copy,
  Check,
  Plus,
  Play,
  FileText,
  Tag,
} from 'lucide-react';
import { MDFile } from '../types';
import { extractPromptVariables } from '../utils/markdownParser';

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: MDFile[];
  onSelectPrompt: (fileId: string) => void;
  onOpenFillModalForFile: (fileId: string) => void;
  onNewPromptTemplate: () => void;
  onToggleFavorite: (fileId: string) => void;
}

export const PromptLibraryModal: React.FC<PromptLibraryModalProps> = ({
  isOpen,
  onClose,
  files,
  onSelectPrompt,
  onOpenFillModalForFile,
  onNewPromptTemplate,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter files that are prompts
  const promptFiles = files.filter((f) => f.isPrompt || f.tags?.includes('ai-prompt') || f.path?.includes('Prompt Library'));

  // Unique tags across prompts
  const promptTags = Array.from(new Set(promptFiles.flatMap((f) => f.tags || [])));

  // Filter based on search, category, and tag
  const filteredPrompts = promptFiles.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = !selectedTag || p.tags.includes(selectedTag);

    let matchesCategory = true;
    if (selectedCategory === 'favorites') {
      matchesCategory = !!p.isFavorite;
    } else if (selectedCategory === 'coding') {
      matchesCategory = p.path.includes('Coding') || p.tags.some((t) => ['code-review', 'typescript', 'system-design', 'sql', 'api'].includes(t));
    } else if (selectedCategory === 'writing') {
      matchesCategory = p.path.includes('Writing') || p.tags.some((t) => ['copywriting', 'marketing', 'documentation', 'seo'].includes(t));
    } else if (selectedCategory === 'productivity') {
      matchesCategory = p.path.includes('Productivity') || p.tags.some((t) => ['prd', 'agile', 'scrum', 'retrospective'].includes(t));
    } else if (selectedCategory === 'creative') {
      matchesCategory = p.path.includes('Creative') || p.tags.some((t) => ['midjourney', 'ux', 'persona', 'image-gen'].includes(t));
    }

    return matchesSearch && matchesTag && matchesCategory;
  });

  const handleCopyRaw = (id: string, content: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] text-zinc-800 dark:text-zinc-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
              <Sparkles className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                AI Prompt Studio & Library
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-mono">
                  {promptFiles.length} Prompts
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Browse, customize, and execute variable-rich AI prompt templates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNewPromptTemplate();
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Custom Prompt</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Navigation */}
        <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/90 dark:bg-zinc-900/90 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Prompts', icon: Sparkles },
              { id: 'favorites', label: 'Favorites', icon: Star },
              { id: 'coding', label: 'Coding & Dev', icon: Code },
              { id: 'writing', label: 'Writing & Copy', icon: PenTool },
              { id: 'productivity', label: 'Productivity & PRDs', icon: Briefcase },
              { id: 'creative', label: 'Creative & AI', icon: Wand2 },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold shadow-xs'
                      : 'bg-white dark:bg-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white dark:text-zinc-950' : 'text-zinc-500 dark:text-zinc-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter prompts or tags..."
              className="w-full pl-9 pr-7 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-all font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 text-xs font-mono cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Tag Filters Strip */}
        {promptTags.length > 0 && (
          <div className="px-6 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center gap-2 overflow-x-auto custom-scrollbar text-xs">
            <span className="text-zinc-500 text-[11px] font-medium shrink-0 flex items-center gap-1 font-mono">
              <Tag className="w-3 h-3 text-zinc-400 dark:text-zinc-500" /> Tags:
            </span>
            <div className="flex items-center gap-1">
              {promptTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-all shrink-0 cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold'
                      : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="text-[10px] text-zinc-600 dark:text-zinc-300 hover:underline shrink-0 ml-auto font-mono cursor-pointer"
              >
                Clear Tag
              </button>
            )}
          </div>
        )}

        {/* Prompt Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-zinc-50 dark:bg-zinc-950">
          {filteredPrompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-zinc-400 dark:text-zinc-500 space-y-3">
              <Sparkles className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm font-medium">No prompt templates match your filter criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedTag(null);
                }}
                className="text-xs text-zinc-700 dark:text-zinc-300 hover:underline cursor-pointer font-mono"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrompts.map((prompt) => {
                const variables = extractPromptVariables(prompt.content);
                const title = prompt.name.replace(/\.md$/, '').replace(/-/g, ' ');

                return (
                  <div
                    key={prompt.id}
                    onClick={() => {
                      onSelectPrompt(prompt.id);
                      onClose();
                    }}
                    className="group relative bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-xs"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 truncate">
                          <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shrink-0">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs capitalize truncate group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                            {title}
                          </h3>
                        </div>

                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(prompt.id);
                          }}
                          className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer shrink-0"
                          title="Toggle Favorite"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              prompt.isFavorite ? 'fill-zinc-900 dark:fill-zinc-200 text-zinc-900 dark:text-zinc-200' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Snippet Preview */}
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-3 font-sans">
                        {prompt.content
                          .replace(/^#+\s/gm, '')
                          .replace(/>\s*/g, '')
                          .replace(/[*_`]/g, '')
                          .slice(0, 130)}
                        ...
                      </p>
                    </div>

                    <div>
                      {/* Variable Badges & Tags */}
                      <div className="flex flex-wrap items-center gap-1 mb-3">
                        {variables.length > 0 ? (
                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[10px] font-mono border border-zinc-200 dark:border-zinc-700">
                            {variables.length} var{variables.length === 1 ? '' : 's'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-950 text-zinc-500 text-[10px] border border-zinc-200 dark:border-zinc-800">
                            Static Prompt
                          </span>
                        )}

                        {prompt.tags?.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 text-[10px] font-mono border border-zinc-200 dark:border-zinc-800"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-1">
                        {variables.length > 0 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenFillModalForFile(prompt.id);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer border border-zinc-300 dark:border-zinc-700"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Fill Vars</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              onSelectPrompt(prompt.id);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium text-[11px] flex items-center gap-1 transition-all cursor-pointer border border-zinc-300 dark:border-zinc-700"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Open</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => handleCopyRaw(prompt.id, prompt.content, e)}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
                          title="Copy Raw Prompt"
                        >
                          {copiedId === prompt.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-zinc-100" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
            <span>Use <code className="text-zinc-900 dark:text-zinc-200 font-mono">{`{{variable}}`}</code> in any Markdown document to transform it into an AI prompt template.</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
