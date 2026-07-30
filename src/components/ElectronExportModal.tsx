import React, { useState } from 'react';
import { Laptop, Copy, Check, Download, X, FileText, Terminal } from 'lucide-react';
import { generateElectronFiles, downloadTextFile } from '../utils/electronExport';

interface ElectronExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ElectronExportModal: React.FC<ElectronExportModalProps> = ({ isOpen, onClose }) => {
  const [activeFile, setActiveFile] = useState<'main.js' | 'preload.js' | 'package.json' | 'README-ELECTRON.md'>('README-ELECTRON.md');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  if (!isOpen) return null;

  const electronFiles = generateElectronFiles();
  const currentContent = electronFiles[activeFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopiedFile(activeFile);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownloadAll = () => {
    Object.entries(electronFiles).forEach(([fileName, content]) => {
      downloadTextFile(fileName, content);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
              <Laptop className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                Electron Desktop App Generator
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Run this Markdown Reader & Prompt Library natively on macOS, Windows, or Linux
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File Tabs */}
        <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-950 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1">
            {(['README-ELECTRON.md', 'main.js', 'preload.js', 'package.json'] as const).map(
              (fileName) => (
                <button
                  key={fileName}
                  onClick={() => setActiveFile(fileName)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeFile === fileName
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{fileName}</span>
                </button>
              )
            )}
          </div>

          <button
            onClick={handleDownloadAll}
            className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All 4 Files</span>
          </button>
        </div>

        {/* Code Content View */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-zinc-50 dark:bg-zinc-950">
          <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>{activeFile}</span>
              </span>

              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-white dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs flex items-center gap-1 cursor-pointer transition-colors border border-zinc-300 dark:border-zinc-700 font-mono"
              >
                {copiedFile === activeFile ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600 dark:text-zinc-100" />
                    <span className="text-zinc-900 dark:text-zinc-100">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-zinc-500 dark:text-zinc-300" />
                    <span>Copy Content</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 text-xs font-mono text-zinc-800 dark:text-zinc-300 bg-white dark:bg-zinc-950 overflow-x-auto leading-relaxed custom-scrollbar max-h-[50vh] whitespace-pre-wrap">
              {currentContent}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-800 dark:bg-zinc-100"></span>
            <span>Ready for Electron v30+ desktop packaging</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
