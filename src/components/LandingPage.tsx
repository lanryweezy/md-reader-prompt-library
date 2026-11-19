import React, { useState } from 'react';
import {
  ArrowRight,
  Download,
  Monitor,
  Apple,
  Terminal,
  Check,
  Copy,
  Sun,
  Moon,
  Code2,
  FileCheck2,
  Laptop,
} from 'lucide-react';
import {
  DESKTOP_PLATFORMS,
  DesktopPlatform,
  detectUserPlatform,
  downloadBuildKitZip,
  getDirectInstallerUrl,
} from '../utils/electronExport';
import { EditorSettings } from '../types';

interface LandingPageProps {
  settings: EditorSettings;
  onUpdateSettings: (newSettings: Partial<EditorSettings>) => void;
  onLaunchWebApp: () => void;
  onOpenElectronModal: () => void;
  canInstallBrowserApp?: boolean;
  onInstallBrowserApp?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  settings,
  onUpdateSettings,
  onLaunchWebApp,
  onOpenElectronModal,
  canInstallBrowserApp,
  onInstallBrowserApp,
}) => {
  const detectedPlatform = detectUserPlatform();
  const [selectedPlatform, setSelectedPlatform] = useState<DesktopPlatform>(detectedPlatform);
  const [downloadingOs, setDownloadingOs] = useState<DesktopPlatform | null>(null);
  const [downloadedZip, setDownloadedZip] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const detectedDirectUrl = getDirectInstallerUrl(detectedPlatform);
  const activePlatformMeta = DESKTOP_PLATFORMS[selectedPlatform];
  const activeDirectUrl = getDirectInstallerUrl(selectedPlatform);

  const fullBuildCommand = `npm install && npm install -D electron electron-builder && ${activePlatformMeta.buildCommand}`;

  const handleDownloadBuildKit = async (platform: DesktopPlatform) => {
    setSelectedPlatform(platform);
    setDownloadingOs(platform);
    try {
      const zipName = await downloadBuildKitZip(platform);
      setDownloadedZip(zipName);
    } finally {
      setTimeout(() => setDownloadingOs(null), 700);
    }
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(fullBuildCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 1800);
  };

  const platformIcon = (os: DesktopPlatform) => {
    if (os === 'win') return <Monitor className="w-4 h-4" />;
    if (os === 'mac') return <Apple className="w-4 h-4" />;
    return <Terminal className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen h-screen overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-950">
      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="font-display text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap shrink-0"
          >
            MD Reader
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a
              href="#features"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0"
            >
              Capabilities
            </a>
            <a
              href="#desktop"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0"
            >
              Desktop &amp; .md Default
            </a>
            <a
              href="#compare"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0"
            >
              Web vs Local
            </a>
          </nav>

          <button
            onClick={onLaunchWebApp}
            className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Open Web App
          </button>
        </div>
      </header>

      <main id="top">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-20 md:pt-28 md:pb-24">
          <div className="max-w-3xl">
            <h1
              className="font-display font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.08]"
              style={{
                fontSize: 'clamp(2.35rem, 4.4vw, 3.75rem)',
                textWrap: 'balance',
              }}
            >
              Write Markdown and reusable prompts, in your browser or as your default .md app.
            </h1>

            <p className="mt-6 text-base md:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
              A calm, local-first Markdown reader and prompt library with live split preview,
              30-second auto-save backups, and native Electron packaging with{' '}
              <code className="font-mono text-sm text-zinc-800 dark:text-zinc-200">.md</code> file
              associations for Windows, macOS, and Linux.
            </p>

            {/* Primary & Secondary Action Row */}
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                onClick={onLaunchWebApp}
                className="px-5 py-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Open Web App</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {detectedDirectUrl ? (
                <a
                  href={detectedDirectUrl}
                  download={DESKTOP_PLATFORMS[detectedPlatform].installerFilename}
                  className="px-5 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    Download {DESKTOP_PLATFORMS[detectedPlatform].name} (
                    {DESKTOP_PLATFORMS[detectedPlatform].installerExt})
                  </span>
                </a>
              ) : canInstallBrowserApp && onInstallBrowserApp ? (
                <button
                  onClick={onInstallBrowserApp}
                  className="px-5 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Laptop className="w-4 h-4" />
                  <span>Install Desktop App</span>
                </button>
              ) : (
                <a
                  href="#desktop"
                  className="px-5 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    Get {DESKTOP_PLATFORMS[detectedPlatform].name} Desktop (
                    {DESKTOP_PLATFORMS[detectedPlatform].installerExt})
                  </span>
                </a>
              )}
            </div>

            {/* Clean Unboxed Metadata Line */}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span>No account required</span>
              <span aria-hidden="true">·</span>
              <span>Default .md file handler</span>
              <span aria-hidden="true">·</span>
              <span>Windows, macOS &amp; Linux</span>
            </div>
          </div>

          {/* Interactive Product Preview Frame */}
          <div className="mt-16 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden">
            {/* Simulated Minimal Window Header */}
            <div className="h-10 px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-zinc-900 dark:text-zinc-200">
                Prompts / code-review.md
              </span>
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline font-mono text-[11px]">Auto-saved · 30s</span>
                <button
                  onClick={onLaunchWebApp}
                  className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline cursor-pointer whitespace-nowrap"
                >
                  Edit live →
                </button>
              </div>
            </div>

            {/* Clean 2-Column Split Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
              <div className="p-6 md:p-8 font-mono text-xs md:text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300 space-y-2">
                <p className="text-zinc-900 dark:text-white font-semibold"># Code Review Prompt</p>
                <p>
                  Review the following{' '}
                  <span className="text-zinc-950 dark:text-white font-semibold">
                    {`{{language}}`}
                  </span>{' '}
                  code with focus on{' '}
                  <span className="text-zinc-950 dark:text-white font-semibold">
                    {`{{focus_area}}`}
                  </span>
                  .
                </p>
                <p className="pt-2 text-zinc-900 dark:text-white font-semibold">## Instructions</p>
                <p>1. Identify edge cases, bugs, or security issues.</p>
                <p>2. Suggest clearer naming and simpler structure.</p>
                <p>3. Provide a concise refactored version.</p>
              </div>

              <div className="p-6 md:p-8 space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                <h2 className="font-display text-xl font-bold text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  Code Review Prompt
                </h2>
                <p>
                  Review the following{' '}
                  <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 font-mono text-xs text-zinc-900 dark:text-zinc-100">
                    TypeScript
                  </code>{' '}
                  code with focus on{' '}
                  <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 font-mono text-xs text-zinc-900 dark:text-zinc-100">
                    security &amp; edge cases
                  </code>
                  .
                </p>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 pt-1">Instructions</h3>
                <ol className="list-decimal pl-5 space-y-1 text-zinc-600 dark:text-zinc-400">
                  <li>Identify edge cases, bugs, or security issues.</li>
                  <li>Suggest clearer naming and simpler structure.</li>
                  <li>Provide a concise refactored version.</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Core Capabilities — Asymmetric Bento Grid */}
        <section
          id="features"
          className="border-t border-zinc-200 dark:border-zinc-800/80 py-20 md:py-24"
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-xl mb-12">
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Built for long writing sessions and double-click .md reading.
              </h2>
              <p className="mt-3 text-sm md:text-base text-zinc-600 dark:text-zinc-400">
                Everything stays quiet until you need it — no clutter, no forced cloud accounts,
                and full control over your plain-text files.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 p-7 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between gap-6">
                <div>
                  <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mb-3">01.</div>
                  <h3 className="font-display text-lg font-semibold text-zinc-950 dark:text-white">
                    Split-Screen Editor &amp; Live Preview
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                    Write in Edit, Split, Preview, or distraction-free Focus mode with synchronized
                    scrolling, interactive checklists, syntax-highlighted code blocks, and a
                    built-in Markdown table builder.
                  </p>
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 flex flex-wrap gap-2">
                  <span>GitHub Flavored Markdown</span>
                  <span aria-hidden="true">·</span>
                  <span>Interactive Checklists</span>
                  <span aria-hidden="true">·</span>
                  <span>Focus Mode</span>
                </div>
              </div>

              <div className="p-7 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between gap-6">
                <div>
                  <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mb-3">02.</div>
                  <h3 className="font-display text-lg font-semibold text-zinc-950 dark:text-white">
                    Editable Prompt Templates
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Add your own prompts using{' '}
                    <code className="font-mono text-xs text-zinc-800 dark:text-zinc-200">{`{{variables}}`}</code>
                    , edit them anytime, and fill placeholders in one step before copying.
                  </p>
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Variable detection · Instant fill modal
                </div>
              </div>

              <div className="p-7 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between gap-6">
                <div>
                  <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mb-3">03.</div>
                  <h3 className="font-display text-lg font-semibold text-zinc-950 dark:text-white">
                    30-Second Auto-Save &amp; Diffs
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Automatic local backup copies every 30 seconds plus manual revision snapshots
                    with line-by-line diffs so long writing sessions never lose progress.
                  </p>
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  30s local backups · One-click restore
                </div>
              </div>

              <div className="md:col-span-2 p-7 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between gap-6">
                <div>
                  <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mb-3">04.</div>
                  <h3 className="font-display text-lg font-semibold text-zinc-950 dark:text-white">
                    Set as Your Default .md File App
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                    Configured with native OS file associations for{' '}
                    <code className="font-mono text-xs">.md</code>,{' '}
                    <code className="font-mono text-xs">.markdown</code>, and{' '}
                    <code className="font-mono text-xs">.mdx</code>. Double-click any Markdown file
                    in Windows Explorer, Finder, or Linux to open it directly in MD Reader and save
                    straight back to disk with <code className="font-mono text-xs">Ctrl+S</code>.
                  </p>
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 flex flex-wrap gap-2">
                  <span>Single-Instance Tab Opening</span>
                  <span aria-hidden="true">·</span>
                  <span>Direct Disk Save</span>
                  <span aria-hidden="true">·</span>
                  <span>OS + Browser File Handler</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cross-Platform Desktop Downloads & Default .md Setup */}
        <section
          id="desktop"
          className="border-t border-zinc-200 dark:border-zinc-800/80 py-20 md:py-24 bg-zinc-50/70 dark:bg-zinc-900/20"
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div className="max-w-2xl">
                <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  Desktop Installers for Windows, macOS, and Linux.
                </h2>
                <p className="mt-3 text-sm md:text-base text-zinc-600 dark:text-zinc-400">
                  {activeDirectUrl
                    ? 'Download the compiled native installer for your operating system to open .md files directly on double-click.'
                    : 'Real .exe, .dmg, and .AppImage installers are compiled with electron-builder (a browser cannot generate a native .exe on the fly). Build locally in one command, publish automatic GitHub Releases, or install immediately as a Chrome/Edge desktop app with .md file handling.'}
                </p>
              </div>

              <button
                onClick={onOpenElectronModal}
                className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900 text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap self-start md:self-auto"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Inspect Electron Config</span>
              </button>
            </div>

            {/* Instant Browser Desktop Install Banner (Works right now with .md file_handlers!) */}
            {!activeDirectUrl && (
              <div className="mb-6 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-zinc-950 dark:text-white flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-zinc-500" />
                    <span>Want to install locally right now without building?</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                    In Chrome or Edge, install MD Reader as a standalone desktop app — it includes a
                    Web App Manifest with <code className="font-mono">.md</code> file handler
                    support so you can right-click any <code className="font-mono">.md</code> file
                    and choose <strong>Open with → MD Reader</strong>.
                  </p>
                </div>

                {canInstallBrowserApp && onInstallBrowserApp ? (
                  <button
                    onClick={onInstallBrowserApp}
                    className="px-4 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start md:self-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install Desktop App</span>
                  </button>
                ) : (
                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 shrink-0">
                    Chrome / Edge menu → Install MD Reader
                  </span>
                )}
              </div>
            )}

            {/* 3 Platform Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(['win', 'mac', 'linux'] as DesktopPlatform[]).map((os) => {
                const info = DESKTOP_PLATFORMS[os];
                const directUrl = getDirectInstallerUrl(os);
                const isDetected = detectedPlatform === os;
                const isSelected = selectedPlatform === os;
                const isBusy = downloadingOs === os;

                return (
                  <div
                    key={os}
                    onClick={() => setSelectedPlatform(os)}
                    className={`p-6 rounded-xl border transition-colors bg-white dark:bg-zinc-950 flex flex-col justify-between gap-6 cursor-pointer ${
                      isSelected
                        ? 'border-zinc-900 dark:border-zinc-200'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2.5 text-zinc-900 dark:text-zinc-100">
                          {platformIcon(os)}
                          <h3 className="font-display text-lg font-semibold">{info.name}</h3>
                        </div>
                        {isDetected && (
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                            Detected OS
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                        <p>{info.shortLabel}</p>
                        <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                          {info.formats}
                        </p>
                        <p className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                          {info.arch} · Registers .md default handler
                        </p>
                      </div>
                    </div>

                    {directUrl ? (
                      <a
                        href={directUrl}
                        download={info.installerFilename}
                        onClick={(e) => e.stopPropagation()}
                        className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
                          isSelected
                            ? 'bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950'
                            : 'bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download {info.installerExt} Installer</span>
                      </a>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadBuildKit(os);
                        }}
                        className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950'
                            : 'bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>
                          {isBusy
                            ? 'Packaging Build Kit...'
                            : `Download ${info.name} Build Kit (.zip)`}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Build Command + Default .md App Instructions */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left: Compile .exe / .dmg / .AppImage Command */}
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between gap-4">
                <div className="space-y-2 min-w-0">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {downloadedZip
                      ? `Downloaded ${downloadedZip} — compile ${activePlatformMeta.installerFilename}:`
                      : `Compile native ${activePlatformMeta.installerFilename} locally:`}
                  </div>
                  <code className="block p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300 overflow-x-auto">
                    {fullBuildCommand}
                  </code>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Or push tag <code className="font-mono">v1.0.0</code> to GitHub — the included
                    workflow compiles &amp; publishes real <code className="font-mono">.exe</code>,{' '}
                    <code className="font-mono">.dmg</code>, and{' '}
                    <code className="font-mono">.AppImage</code> binaries to GitHub Releases. Set{' '}
                    <code className="font-mono">VITE_GITHUB_REPO</code> to switch the buttons above
                    to direct binary downloads.
                  </p>
                </div>

                <button
                  onClick={handleCopyCommand}
                  className="px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap self-start"
                >
                  {copiedCmd ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Copied Build Command</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Build Command</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right: Set as Default .md App Steps */}
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  <FileCheck2 className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span>
                    How to set MD Reader as your default .md app ({activePlatformMeta.name})
                  </span>
                </div>
                <ol className="list-decimal pl-5 space-y-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {activePlatformMeta.defaultAppSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Web vs Local Desktop Comparison */}
        <section
          id="compare"
          className="border-t border-zinc-200 dark:border-zinc-800/80 py-20 md:py-24"
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-xl mb-10">
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Use instantly on the web, or install locally.
              </h2>
            </div>

            <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    <th className="py-3.5 px-5">Capability</th>
                    <th className="py-3.5 px-5 text-zinc-900 dark:text-zinc-100">Web App</th>
                    <th className="py-3.5 px-5 text-zinc-900 dark:text-zinc-100">
                      Desktop App (Electron)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs md:text-sm">
                  <tr>
                    <td className="py-3.5 px-5 font-medium text-zinc-900 dark:text-zinc-100">
                      Setup
                    </td>
                    <td className="py-3.5 px-5 text-zinc-600 dark:text-zinc-400">
                      Instant in browser (or 1-click Chrome/Edge Install App)
                    </td>
                    <td className="py-3.5 px-5 text-zinc-600 dark:text-zinc-400">
                      Native .exe, .dmg, .AppImage, or .deb installer
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-medium text-zinc-900 dark:text-zinc-100">
                      Default .md File Handler
                    </td>
                    <td className="py-3.5 px-5 text-zinc-600 dark:text-zinc-400">
                      Supported when installed via Chrome / Edge
                    </td>
                    <td className="py-3.5 px-5 text-zinc-600 dark:text-zinc-400">
                      Native OS file association for .md, .markdown, .mdx
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-medium text-zinc-900 dark:text-zinc-100">
                      File Access
                    </td>
                    <td className="py-3.5 px-5 text-zinc-600 dark:text-zinc-400">
                      Drag &amp; drop, file upload, and download .md
                    </td>
                    <td className="py-3.5 px-5 text-zinc-600 dark:text-zinc-400">
                      Double-click .md to open, Open Folder, Save straight to disk
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-medium text-zinc-900 dark:text-zinc-100">
                      Auto-Save &amp; History
                    </td>
                    <td className="py-3.5 px-5 text-zinc-600 dark:text-zinc-400">
                      30-second localStorage backups + snapshots
                    </td>
                    <td className="py-3.5 px-5 text-zinc-600 dark:text-zinc-400">
                      30-second local backups + native Ctrl+S disk saves
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom Conversion Row */}
            <div className="mt-14 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-10 border-t border-zinc-200 dark:border-zinc-800/80">
              <div>
                <h3 className="font-display text-xl font-semibold text-zinc-950 dark:text-white">
                  Ready to write?
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Open the editor directly in your browser — your drafts stay private on your
                  device.
                </p>
              </div>
              <button
                onClick={onLaunchWebApp}
                className="px-5 py-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
              >
                <span>Open Web App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-display font-semibold text-zinc-900 dark:text-zinc-100">
            MD Reader
          </span>

          <div className="flex flex-wrap items-center gap-5">
            <button
              onClick={onLaunchWebApp}
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            >
              Web App
            </button>
            <a
              href="#desktop"
              onClick={() => setSelectedPlatform('win')}
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Windows (.exe)
            </a>
            <a
              href="#desktop"
              onClick={() => setSelectedPlatform('mac')}
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              macOS (.dmg)
            </a>
            <a
              href="#desktop"
              onClick={() => setSelectedPlatform('linux')}
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Linux (.AppImage)
            </a>
            <button
              onClick={onOpenElectronModal}
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            >
              Electron Config
            </button>
            <button
              onClick={() =>
                onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
              }
              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle color theme"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
