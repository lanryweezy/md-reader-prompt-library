import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, X, Send, RefreshCw, Wand2, ArrowRight } from 'lucide-react';
import { extractPromptVariables, fillPromptVariables } from '../utils/markdownParser';

interface PromptFillModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawContent: string;
  onApplyToEditor: (filledContent: string) => void;
}

export const PromptFillModal: React.FC<PromptFillModalProps> = ({
  isOpen,
  onClose,
  rawContent,
  onApplyToEditor,
}) => {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const variables = extractPromptVariables(rawContent);

  useEffect(() => {
    if (!isOpen) return;
    const initial: Record<string, string> = {};
    variables.forEach((v) => {
      initial[v.name] = '';
    });
    setVariableValues(initial);
  }, [isOpen, rawContent]);

  if (!isOpen) return null;

  const filledPrompt = fillPromptVariables(rawContent, variableValues);

  const handleCopy = () => {
    navigator.clipboard.writeText(filledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    onApplyToEditor(filledPrompt);
    onClose();
  };

  // Smart sample data generator based on variable names
  const handleFillSampleData = () => {
    const samples: Record<string, string> = {};
    variables.forEach((v) => {
      const name = v.name.toLowerCase();
      if (name.includes('lang') || name.includes('framework')) {
        samples[v.name] = 'TypeScript / React 18';
      } else if (name.includes('goal') || name.includes('objective')) {
        samples[v.name] = 'Ensure memory safety and reduce redundant re-renders';
      } else if (name.includes('level') || name.includes('strict')) {
        samples[v.name] = 'Strict Security & Performance';
      } else if (name.includes('system') || name.includes('product')) {
        samples[v.name] = 'Nexus Cloud Dispatch Engine';
      } else if (name.includes('scale')) {
        samples[v.name] = '100,000 requests/sec peak';
      } else if (name.includes('sla') || name.includes('latency')) {
        samples[v.name] = '< 50ms p99 SLA';
      } else if (name.includes('audience') || name.includes('persona')) {
        samples[v.name] = 'Senior Full-Stack Developers & Tech Leads';
      } else if (name.includes('tone')) {
        samples[v.name] = 'Authoritative, clear, and action-driven';
      } else if (name.includes('query') || name.includes('sql')) {
        samples[v.name] = 'SELECT u.id, count(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id;';
      } else if (name.includes('aspect')) {
        samples[v.name] = '16:9';
      } else if (name.includes('style')) {
        samples[v.name] = 'Photorealistic Monochrome High Contrast';
      } else {
        samples[v.name] = `Sample ${v.name.replace(/_/g, ' ')}`;
      }
    });
    setVariableValues(samples);
  };

  const handleClear = () => {
    const empty: Record<string, string> = {};
    variables.forEach((v) => {
      empty[v.name] = '';
    });
    setVariableValues(empty);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-zinc-800 dark:text-zinc-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
              <Sparkles className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                Fill Prompt Variables
                <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-mono border border-zinc-300 dark:border-zinc-700">
                  {variables.length} Variables
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                Replace <code className="text-zinc-800 dark:text-zinc-200 font-mono">{`{{placeholders}}`}</code> with specific project context
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFillSampleData}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="Auto-fill with realistic sample data"
            >
              <Wand2 className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-100" />
              <span className="hidden sm:inline">Fill Sample Data</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <span>Input Variables:</span>
              <button
                onClick={handleClear}
                className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 flex items-center gap-1 cursor-pointer font-mono"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Fields</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {variables.map((v) => {
                const isCodeOrLong =
                  v.name.toLowerCase().includes('query') ||
                  v.name.toLowerCase().includes('code') ||
                  v.name.toLowerCase().includes('body') ||
                  v.name.toLowerCase().includes('input');

                return (
                  <div
                    key={v.name}
                    className={`space-y-1.5 ${isCodeOrLong ? 'md:col-span-2' : ''}`}
                  >
                    <label className="text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 dark:bg-zinc-100"></span>
                      <span>{`{{${v.name}}}`}</span>
                    </label>

                    {isCodeOrLong ? (
                      <textarea
                        rows={3}
                        value={variableValues[v.name] || ''}
                        onChange={(e) =>
                          setVariableValues({ ...variableValues, [v.name]: e.target.value })
                        }
                        placeholder={`Enter multiline content for ${v.name}...`}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-all custom-scrollbar font-mono"
                      />
                    ) : (
                      <input
                        type="text"
                        value={variableValues[v.name] || ''}
                        onChange={(e) =>
                          setVariableValues({ ...variableValues, [v.name]: e.target.value })
                        }
                        placeholder={`Value for ${v.name}...`}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-all font-sans"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Result Preview Box */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              <span className="flex items-center gap-1.5">
                <span>Rendered Result Preview</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </span>
              <span className="font-mono text-[11px] text-zinc-500">
                {filledPrompt.length} chars
              </span>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 max-h-56 overflow-y-auto font-mono text-xs text-zinc-800 dark:text-zinc-300 leading-relaxed custom-scrollbar whitespace-pre-wrap selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-zinc-900 dark:selection:text-white">
              {filledPrompt}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-zinc-100" />
                  <span className="text-zinc-900 dark:text-zinc-100">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                  <span>Copy Filled Prompt</span>
                </>
              )}
            </button>

            <button
              onClick={handleApply}
              className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4 fill-white dark:fill-zinc-950" />
              <span>Apply to Editor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
