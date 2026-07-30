import React, { useState } from 'react';
import { Sparkles, Copy, Check, Play, CopyPlus, Variable } from 'lucide-react';
import { extractPromptVariables } from '../utils/markdownParser';

interface PromptActionBarProps {
  content: string;
  onOpenFillModal: () => void;
  onDuplicatePrompt: () => void;
}

export const PromptActionBar: React.FC<PromptActionBarProps> = ({
  content,
  onOpenFillModal,
  onDuplicatePrompt,
}) => {
  const [copied, setCopied] = useState(false);
  const variables = extractPromptVariables(content);

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-950 border-b border-zinc-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
      {/* Left: Badge & Detected Variables */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-100 font-semibold border border-zinc-700 tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-zinc-100" />
          <span>AI Prompt Template</span>
        </div>

        {variables.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-zinc-400 text-[11px] flex items-center gap-1 font-mono">
              <Variable className="w-3 h-3 text-zinc-400" />
              {variables.length} Variable{variables.length === 1 ? '' : 's'}:
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {variables.slice(0, 5).map((v) => (
                <span
                  key={v.name}
                  className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-200 font-mono text-[10px] border border-zinc-800"
                >
                  {`{{${v.name}}}`}
                </span>
              ))}
              {variables.length > 5 && (
                <span className="text-[10px] text-zinc-500 font-mono">
                  +{variables.length - 5} more
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-[11px] text-zinc-500 italic">
            No <code className="text-zinc-300 font-mono">{`{{placeholders}}`}</code> detected
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {variables.length > 0 && (
          <button
            onClick={onOpenFillModal}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Fill in {{variables}} and generate final prompt text"
          >
            <Play className="w-3.5 h-3.5 fill-zinc-950" />
            <span>Fill Variables</span>
          </button>
        )}

        <button
          onClick={handleCopyRaw}
          className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800 flex items-center gap-1.5 transition-all cursor-pointer font-medium"
          title="Copy raw prompt text to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-zinc-100" />
              <span className="text-zinc-100">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Copy Raw</span>
            </>
          )}
        </button>

        <button
          onClick={onDuplicatePrompt}
          className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800 flex items-center gap-1.5 transition-all cursor-pointer font-medium"
          title="Duplicate this prompt template"
        >
          <CopyPlus className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Duplicate</span>
        </button>
      </div>
    </div>
  );
};
