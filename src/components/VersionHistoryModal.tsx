import React, { useState } from 'react';
import {
  History,
  X,
  Plus,
  RotateCcw,
  Trash2,
  Clock,
  FileText,
  Check,
  Columns,
  GitCompare,
  Eye,
  ChevronRight,
  ArrowLeftRight,
} from 'lucide-react';
import { FileVersion, MDFile } from '../types';
import { getDocumentStats, parseMarkdownToHTML } from '../utils/markdownParser';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFile: MDFile;
  versions: FileVersion[];
  onCreateSnapshot: (fileId: string, label?: string) => void;
  onRestoreVersion: (version: FileVersion) => void;
  onDeleteVersion: (versionId: string) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  activeFile,
  versions,
  onCreateSnapshot,
  onRestoreVersion,
  onDeleteVersion,
}) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [snapshotLabelInput, setSnapshotLabelInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [diffViewMode, setDiffViewMode] = useState<'split' | 'unified' | 'preview'>('unified');
  const [restoredSuccessId, setRestoredSuccessId] = useState<string | null>(null);

  if (!isOpen || !activeFile) return null;

  // Filter versions belonging to the active file, ordered newest first
  const fileVersions = versions
    .filter((v) => v.fileId === activeFile.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  // Default select the latest version if none selected
  const activeSelectedVersion =
    fileVersions.find((v) => v.id === selectedVersionId) || fileVersions[0] || null;

  const currentStats = getDocumentStats(activeFile.content);

  const handleCreateNewSnapshot = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const label = snapshotLabelInput.trim() || `Snapshot ${fileVersions.length + 1}`;
    onCreateSnapshot(activeFile.id, label);
    setSnapshotLabelInput('');
    setIsCreating(false);
  };

  const handleRestore = (version: FileVersion) => {
    onRestoreVersion(version);
    setRestoredSuccessId(version.id);
    setTimeout(() => {
      setRestoredSuccessId(null);
      onClose();
    }, 1200);
  };

  // Simple line-by-line diff computation for Unified View
  const computeLineDiff = (oldText: string, newText: string) => {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');

    // Basic diff comparison
    const maxLines = Math.max(oldLines.length, newLines.length);
    const diffResult: { type: 'added' | 'removed' | 'unchanged'; line: string; numOld?: number; numNew?: number }[] = [];

    let i = 0;
    let j = 0;

    while (i < oldLines.length || j < newLines.length) {
      if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
        diffResult.push({ type: 'unchanged', line: oldLines[i], numOld: i + 1, numNew: j + 1 });
        i++;
        j++;
      } else if (
        j < newLines.length &&
        (!oldLines.slice(i, i + 3).includes(newLines[j]) || i >= oldLines.length)
      ) {
        diffResult.push({ type: 'added', line: newLines[j], numNew: j + 1 });
        j++;
      } else if (i < oldLines.length) {
        diffResult.push({ type: 'removed', line: oldLines[i], numOld: i + 1 });
        i++;
      }
    }

    return diffResult;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-6xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] text-zinc-800 dark:text-zinc-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
              <History className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Document Revision History
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-mono">
                  {fileVersions.length} Snapshots
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono truncate max-w-md">
                Comparing current state of <strong className="text-zinc-800 dark:text-zinc-200">{activeFile.name}</strong> ({currentStats.words} words)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Save Snapshot</span>
              </button>
            ) : (
              <form onSubmit={handleCreateNewSnapshot} className="flex items-center gap-2 animate-in fade-in duration-150">
                <input
                  type="text"
                  value={snapshotLabelInput}
                  onChange={(e) => setSnapshotLabelInput(e.target.value)}
                  placeholder="Snapshot label e.g., Pre-edit draft..."
                  autoFocus
                  className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500 font-mono w-56"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold rounded-lg text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left Timeline Panel + Right Diff Panel */}
        <div className="flex-1 flex overflow-hidden bg-zinc-50 dark:bg-zinc-950">
          {/* Left: Version History Timeline List */}
          <div className="w-80 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-950 overflow-y-auto custom-scrollbar shrink-0">
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
              <span className="uppercase tracking-wider font-semibold">Snapshot Timeline</span>
              <span>{fileVersions.length} Saved</span>
            </div>

            {/* Current Active Editor State Card */}
            <div className="p-3 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/30 dark:bg-zinc-900/30">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Current Active Draft
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Live Editor</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                {currentStats.words} words • {currentStats.lines} lines
              </p>
            </div>

            {/* Version Items List */}
            {fileVersions.length === 0 ? (
              <div className="p-6 text-center text-zinc-400 dark:text-zinc-500 space-y-3">
                <History className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <p className="text-xs">No version snapshots saved for this document yet.</p>
                <button
                  onClick={() => handleCreateNewSnapshot()}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs border border-zinc-200 dark:border-zinc-800 font-mono cursor-pointer"
                >
                  Create First Snapshot
                </button>
              </div>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {fileVersions.map((v) => {
                  const isSelected = activeSelectedVersion?.id === v.id;
                  const wordDiff = v.wordCount - currentStats.words;
                  const dateStr = new Date(v.timestamp).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVersionId(v.id)}
                      className={`p-3.5 flex flex-col gap-1.5 transition-all cursor-pointer border-l-2 ${
                        isSelected
                          ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 shadow-xs'
                          : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                          <span className="truncate">{v.label || 'Saved Version'}</span>
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteVersion(v.id);
                          }}
                          className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
                          title="Delete snapshot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span>{dateStr}</span>
                        <span
                          className={
                            wordDiff > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : wordDiff < 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-zinc-500'
                          }
                        >
                          {v.wordCount} words ({wordDiff >= 0 ? `+${wordDiff}` : wordDiff})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Comparison Diff View */}
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
            {activeSelectedVersion ? (
              <>
                {/* Diff Controls Header */}
                <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 dark:text-zinc-400 font-mono">View Mode:</span>
                    <div className="flex items-center gap-1 bg-white dark:bg-zinc-950 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono">
                      <button
                        onClick={() => setDiffViewMode('unified')}
                        className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                          diffViewMode === 'unified'
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                        <span>Unified Line Diff</span>
                      </button>

                      <button
                        onClick={() => setDiffViewMode('split')}
                        className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                          diffViewMode === 'split'
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                      >
                        <Columns className="w-3.5 h-3.5" />
                        <span>Side-by-Side</span>
                      </button>

                      <button
                        onClick={() => setDiffViewMode('preview')}
                        className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                          diffViewMode === 'preview'
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Snapshot Render</span>
                      </button>
                    </div>
                  </div>

                  {/* Restore Button */}
                  <button
                    onClick={() => handleRestore(activeSelectedVersion)}
                    className="px-4 py-1.5 rounded-xl bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    {restoredSuccessId === activeSelectedVersion.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 stroke-[3]" />
                        <span>Restored!</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                        <span>Restore this Snapshot</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Diff Renderer */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-zinc-50 dark:bg-zinc-950 font-mono text-xs">
                  {diffViewMode === 'unified' && (
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/40">
                      <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span>Comparing Live Editor (Green) vs Historic Snapshot (Red)</span>
                        <span>{activeSelectedVersion.label}</span>
                      </div>
                      <div className="p-3 divide-y divide-zinc-200/50 dark:divide-zinc-900/50 leading-relaxed overflow-x-auto">
                        {computeLineDiff(activeSelectedVersion.content, activeFile.content).map(
                          (diff, idx) => (
                            <div
                              key={idx}
                              className={`flex items-start gap-3 py-1 px-2 rounded font-mono ${
                                diff.type === 'added'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-l-2 border-emerald-500'
                                  : diff.type === 'removed'
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-l-2 border-rose-500 line-through opacity-80'
                                  : 'text-zinc-600 dark:text-zinc-400'
                              }`}
                            >
                              <span className="w-6 text-right select-none text-zinc-400 dark:text-zinc-600 shrink-0 text-[10px]">
                                {diff.numNew || diff.numOld || ''}
                              </span>
                              <span className="w-4 text-center select-none font-bold shrink-0">
                                {diff.type === 'added' ? '+' : diff.type === 'removed' ? '-' : ' '}
                              </span>
                              <pre className="whitespace-pre-wrap font-mono flex-1">{diff.line || ' '}</pre>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {diffViewMode === 'split' && (
                    <div className="grid grid-cols-2 gap-4 h-full">
                      {/* Historic Snapshot Content */}
                      <div className="flex flex-col border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/30">
                        <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-700 dark:text-zinc-300 text-[11px] flex items-center justify-between">
                          <span>Historic Snapshot ({activeSelectedVersion.label})</span>
                          <span>{activeSelectedVersion.wordCount} words</span>
                        </div>
                        <pre className="p-3 text-zinc-800 dark:text-zinc-300 leading-relaxed overflow-y-auto whitespace-pre-wrap font-mono flex-1">
                          {activeSelectedVersion.content}
                        </pre>
                      </div>

                      {/* Current Active Editor Content */}
                      <div className="flex flex-col border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/30">
                        <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100 text-[11px] flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Current Active Draft
                          </span>
                          <span>{currentStats.words} words</span>
                        </div>
                        <pre className="p-3 text-zinc-800 dark:text-zinc-200 leading-relaxed overflow-y-auto whitespace-pre-wrap font-mono flex-1">
                          {activeFile.content}
                        </pre>
                      </div>
                    </div>
                  )}

                  {diffViewMode === 'preview' && (
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-900/30 font-sans">
                      <div className="mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                        <span>Rendered Preview of Historic Snapshot ({activeSelectedVersion.label})</span>
                        <span>{new Date(activeSelectedVersion.timestamp).toLocaleString()}</span>
                      </div>
                      <article
                        className="markdown-body max-w-3xl mx-auto leading-relaxed text-zinc-800 dark:text-zinc-200"
                        dangerouslySetInnerHTML={{
                          __html: parseMarkdownToHTML(activeSelectedVersion.content),
                        }}
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-zinc-400 dark:text-zinc-500 p-8 text-center space-y-2">
                <ArrowLeftRight className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                <p className="text-sm font-medium">Select a snapshot on the left to compare or restore.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <History className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
            <span>Snapshots are stored securely in local workspace storage.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
