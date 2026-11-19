import React, { useState } from 'react';
import { Laptop, Copy, Check, Download, X, FileText, Terminal, FileCheck2 } from 'lucide-react';
import {
  DESKTOP_PLATFORMS,
  DesktopPlatform,
  ElectronFiles,
  detectUserPlatform,
  downloadBuildKitZip,
  generateElectronFiles,
  getDirectInstallerUrl,
} from '../utils/electronExport';

interface ElectronExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ElectronFileKey = keyof ElectronFiles;

export const ElectronExportModal: React.FC<ElectronExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<DesktopPlatform>(detectUserPlatform());
  const [activeFile, setActiveFile] = useState<ElectronFileKey>('BUILD-DESKTOP.md');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [downloadingOs, setDownloadingOs] = useState<DesktopPlatform | null>(null);

  if (!isOpen) return null;

  const electronFiles = generateElectronFiles();
  const currentContent = electronFiles[activeFile];
  const platformMeta = DESKTOP_PLATFORMS[selectedPlatform];
  const directUrl = getDirectInstallerUrl(selectedPlatform);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopiedFile(activeFile);
    setTimeout(() => setCopiedFile(null), 1800);
  };

  const handleDownloadZip = async (platform: DesktopPlatform) => {
    setDownloadingOs(platform);
    try {
      await downloadBuildKitZip(platform);
    } finally {
      setTimeout(() => setDownloadingOs(null), 900);
    }
  };

  const fileTabs: ElectronFileKey[] = [
    'BUILD-DESKTOP.md',
    'electron-builder.yml',
    'electron/main.cjs',
    'electron/preload.cjs',
    '.github/workflows/build-desktop.yml',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <Laptop className="w-5 h-5 text-zinc-800 dark:text-zinc-200 shrink-0" />
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                Desktop Installers (.exe / .dmg / .AppImage) &amp; Default .md Handler
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Compile real native binaries locally or publish direct downloads via GitHub Releases
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Platform Selector + Default .md App Guide */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {(['win', 'mac', 'linux'] as DesktopPlatform[]).map((os) => {
                const info = DESKTOP_PLATFORMS[os];
                const isSelected = selectedPlatform === os;
                return (
                  <button
                    key={os}
                    onClick={() => setSelectedPlatform(os)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {info.name} ({info.installerExt})
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {directUrl ? (
                <a
                  href={directUrl}
                  download={platformMeta.installerFilename}
                  className="px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {platformMeta.installerFilename}</span>
                </a>
              ) : (
                <button
                  onClick={() => handleDownloadZip(selectedPlatform)}
                  className="px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {downloadingOs === selectedPlatform
                      ? 'Preparing .zip...'
                      : `Download Build Kit (.zip)`}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-900 dark:text-zinc-100">
              <FileCheck2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>Setting MD Reader as default app for .md files on {platformMeta.name}</span>
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
              {platformMeta.defaultAppSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
            {!directUrl && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                Note: Browsers cannot compile native <code className="font-mono">{platformMeta.installerExt}</code> binaries in-browser. Run{' '}
                <code className="font-mono text-zinc-800 dark:text-zinc-200">{platformMeta.buildCommand}</code> locally, or push a{' '}
                <code className="font-mono">v*</code> tag to GitHub Actions and set{' '}
                <code className="font-mono">VITE_GITHUB_REPO</code> for direct 1-click{' '}
                <code className="font-mono">{platformMeta.installerExt}</code> downloads.
              </p>
            )}
          </div>
        </div>

        {/* File Tabs */}
        <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {fileTabs.map((fileName) => (
            <button
              key={fileName}
              onClick={() => setActiveFile(fileName)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeFile === fileName
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>{fileName}</span>
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-zinc-50 dark:bg-zinc-950">
          <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>{activeFile}</span>
              </span>

              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-white dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs flex items-center gap-1 cursor-pointer transition-colors border border-zinc-200 dark:border-zinc-700"
              >
                {copiedFile === activeFile ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 text-xs font-mono text-zinc-800 dark:text-zinc-300 bg-white dark:bg-zinc-950 overflow-x-auto leading-relaxed custom-scrollbar max-h-[36vh] whitespace-pre-wrap">
              {currentContent}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-mono">.md · .markdown · .mdx file associations included</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
