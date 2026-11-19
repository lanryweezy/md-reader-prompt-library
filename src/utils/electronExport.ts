import JSZip from 'jszip';

export type DesktopPlatform = 'win' | 'mac' | 'linux';

export interface ElectronFiles {
  'electron/main.cjs': string;
  'electron/preload.cjs': string;
  'electron-builder.yml': string;
  '.github/workflows/build-desktop.yml': string;
  'BUILD-DESKTOP.md': string;
}

export interface PlatformMeta {
  id: DesktopPlatform;
  name: string;
  shortLabel: string;
  installerExt: string;
  installerFilename: string;
  formats: string;
  arch: string;
  buildCommand: string;
  scriptName: string;
  zipName: string;
  defaultAppSteps: string[];
}

export const DESKTOP_PLATFORMS: Record<DesktopPlatform, PlatformMeta> = {
  win: {
    id: 'win',
    name: 'Windows',
    shortLabel: 'Windows 10 / 11',
    installerExt: '.exe',
    installerFilename: 'MD-Reader-Setup-Windows-x64.exe',
    formats: 'NSIS Installer (.exe) · Portable (.exe)',
    arch: 'x64',
    buildCommand: 'npm run electron:build:win',
    scriptName: 'build-windows.bat',
    zipName: 'MD-Reader-Windows-Build-Kit.zip',
    defaultAppSteps: [
      'Run MD-Reader-Setup-Windows-x64.exe — the installer registers .md, .markdown, and .mdx automatically.',
      'Right-click any .md file → Open with → Choose another app → select MD Reader → click Always.',
      'Or open Windows Settings → Apps → Default apps → search ".md" → choose MD Reader.',
    ],
  },
  mac: {
    id: 'mac',
    name: 'macOS',
    shortLabel: 'macOS 12+',
    installerExt: '.dmg',
    installerFilename: 'MD-Reader-macOS-arm64.dmg',
    formats: 'Disk Image (.dmg) · Archive (.zip)',
    arch: 'Apple Silicon (arm64) & Intel (x64)',
    buildCommand: 'npm run electron:build:mac',
    scriptName: 'build-macos.command',
    zipName: 'MD-Reader-macOS-Build-Kit.zip',
    defaultAppSteps: [
      'Open MD-Reader-macOS-arm64.dmg and drag MD Reader into Applications.',
      'Right-click any .md file in Finder → Get Info → Open with: MD Reader.',
      'Click "Change All…" so every .md document opens in MD Reader on double-click.',
    ],
  },
  linux: {
    id: 'linux',
    name: 'Linux',
    shortLabel: 'Ubuntu, Fedora & Arch',
    installerExt: '.AppImage',
    installerFilename: 'MD-Reader-Linux-x64.AppImage',
    formats: 'AppImage · Debian Package (.deb)',
    arch: 'x64',
    buildCommand: 'npm run electron:build:linux',
    scriptName: 'build-linux.sh',
    zipName: 'MD-Reader-Linux-Build-Kit.zip',
    defaultAppSteps: [
      'Install the .deb package (sudo apt install ./MD-Reader-Linux-x64.deb) to register the text/markdown MIME type automatically.',
      'Right-click any .md file → Properties → Open With → select MD Reader → Set as default.',
      'Or run: xdg-mime default md-reader.desktop text/markdown',
    ],
  },
};

export function detectUserPlatform(): DesktopPlatform {
  if (typeof navigator === 'undefined') return 'mac';
  const ua = `${navigator.userAgent} ${navigator.platform || ''}`.toLowerCase();
  if (ua.includes('win')) return 'win';
  if (ua.includes('linux') && !ua.includes('android')) return 'linux';
  return 'mac';
}

/**
 * Returns a direct compiled binary URL (.exe / .dmg / .AppImage) if configured via
 * VITE_WIN_INSTALLER_URL / VITE_MAC_INSTALLER_URL / VITE_LINUX_INSTALLER_URL
 * or VITE_GITHUB_REPO (which resolves to GitHub Releases latest/download).
 */
export function getDirectInstallerUrl(platform: DesktopPlatform): string | null {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};

  const directEnvKey: Record<DesktopPlatform, string> = {
    win: 'VITE_WIN_INSTALLER_URL',
    mac: 'VITE_MAC_INSTALLER_URL',
    linux: 'VITE_LINUX_INSTALLER_URL',
  };

  const explicitUrl = env[directEnvKey[platform]]?.trim();
  if (explicitUrl) return explicitUrl;

  const githubRepo = env.VITE_GITHUB_REPO?.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
  if (githubRepo) {
    const filename = DESKTOP_PLATFORMS[platform].installerFilename;
    return `https://github.com/${githubRepo}/releases/latest/download/${filename}`;
  }

  return null;
}

export function generateElectronFiles(): ElectronFiles {
  const mainCjs = `const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');

const isDev = Boolean(process.env.ELECTRON_START_URL);
const SUPPORTED_EXTENSIONS = new Set(['.md', '.markdown', '.mdx', '.mdown', '.mkd', '.txt']);

let mainWindow = null;
const pendingOpenedFiles = [];

function isSupportedMarkdownFile(candidatePath) {
  if (!candidatePath || typeof candidatePath !== 'string') return false;
  if (candidatePath.startsWith('-')) return false;
  const ext = path.extname(candidatePath).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(ext)) return false;
  try {
    return fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile();
  } catch {
    return false;
  }
}

function readNativeFile(filePath) {
  try {
    const resolved = path.resolve(filePath);
    if (!isSupportedMarkdownFile(resolved)) return null;
    return {
      path: resolved,
      name: path.basename(resolved),
      content: fs.readFileSync(resolved, 'utf-8'),
    };
  } catch (err) {
    console.error('Failed to read file opened from OS:', err);
    return null;
  }
}

function extractFilePathsFromArgv(argv) {
  const startIndex = app.isPackaged ? 1 : 2;
  return argv.slice(startIndex).filter(isSupportedMarkdownFile);
}

function enqueueOrDeliverFile(filePath) {
  const fileData = readNativeFile(filePath);
  if (!fileData) return;
  if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.webContents.isLoading()) {
    mainWindow.webContents.send('file:opened-from-os', fileData);
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  } else {
    pendingOpenedFiles.push(fileData);
  }
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    extractFilePathsFromArgv(commandLine).forEach(enqueueOrDeliverFile);
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

app.on('open-file', (event, filePath) => {
  event.preventDefault();
  enqueueOrDeliverFile(filePath);
});

extractFilePathsFromArgv(process.argv).forEach((fp) => {
  const data = readNativeFile(fp);
  if (data) pendingOpenedFiles.push(data);
});

async function openDefaultAppsGuide() {
  if (process.platform === 'win32') {
    await shell.openExternal('ms-settings:defaultapps');
    return {
      openedSettings: true,
      platform: 'win32',
      message: 'Opened Windows Default Apps. Search for ".md" and select MD Reader.',
    };
  }
  if (process.platform === 'darwin') {
    return {
      openedSettings: false,
      platform: 'darwin',
      message: 'In Finder, right-click any .md file → Get Info → Open with: MD Reader → Change All…',
    };
  }
  return new Promise((resolve) => {
    execFile('xdg-mime', ['default', 'md-reader.desktop', 'text/markdown'], (err) => {
      resolve({
        openedSettings: !err,
        platform: 'linux',
        message: err
          ? 'Right-click any .md file → Properties → Open With → select MD Reader.'
          : 'Registered MD Reader as the default handler for text/markdown files.',
      });
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: 'MD Reader',
    backgroundColor: '#09090b',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('file:getPendingOpened', async () => pendingOpenedFiles.splice(0, pendingOpenedFiles.length));
ipcMain.handle('app:openDefaultAppsSettings', async () => openDefaultAppsGuide());

ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Markdown Files', extensions: ['md', 'markdown', 'mdx', 'txt'] }],
  });
  if (canceled || filePaths.length === 0) return null;
  return filePaths.map((fp) => ({
    path: fp,
    name: path.basename(fp),
    content: fs.readFileSync(fp, 'utf-8'),
  }));
});

ipcMain.handle('dialog:openFolder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  if (canceled || filePaths.length === 0) return null;
  const dirPath = filePaths[0];
  const files = [];

  function scanDirectory(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) && entry.name.toLowerCase() !== '.txt') {
        files.push({
          path: fullPath,
          name: entry.name,
          content: fs.readFileSync(fullPath, 'utf-8'),
        });
      }
    }
  }

  scanDirectory(dirPath);
  return { folderPath: dirPath, folderName: path.basename(dirPath), files };
});

ipcMain.handle('file:save', async (_event, { filePath, defaultName, content }) => {
  let targetPath = filePath;
  if (!targetPath || !path.isAbsolute(targetPath)) {
    const { canceled, filePath: chosenPath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultName || 'document.md',
      filters: [{ name: 'Markdown File', extensions: ['md', 'markdown', 'mdx', 'txt'] }],
    });
    if (canceled || !chosenPath) return { success: false };
    targetPath = chosenPath;
  }
  fs.writeFileSync(targetPath, content, 'utf-8');
  return { success: true, path: targetPath, name: path.basename(targetPath) };
});
`;

  const preloadCjs = `const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  openFiles: () => ipcRenderer.invoke('dialog:openFile'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  saveFile: (payload) => ipcRenderer.invoke('file:save', payload),
  getPendingFiles: () => ipcRenderer.invoke('file:getPendingOpened'),
  onFileOpenedFromOS: (callback) => {
    const listener = (_event, fileData) => callback(fileData);
    ipcRenderer.on('file:opened-from-os', listener);
    return () => ipcRenderer.removeListener('file:opened-from-os', listener);
  },
  openDefaultAppsSettings: () => ipcRenderer.invoke('app:openDefaultAppsSettings'),
});
`;

  const builderYml = `appId: com.mdreader.desktop
productName: MD Reader
copyright: Copyright © 2026 MD Reader

directories:
  output: release/\${version}
  buildResources: build

files:
  - dist/**/*
  - electron/**/*
  - package.json

fileAssociations:
  - ext:
      - md
      - markdown
      - mdx
      - mdown
      - mkd
    name: Markdown Document
    description: Markdown Document
    role: Editor
    mimeType: text/markdown

mac:
  category: public.app-category.productivity
  artifactName: MD-Reader-macOS-\${arch}.\${ext}
  target:
    - target: dmg
      arch: [arm64, x64]
    - target: zip
      arch: [arm64, x64]

win:
  target:
    - target: nsis
      arch: [x64]
    - target: portable
      arch: [x64]

nsis:
  artifactName: MD-Reader-Setup-Windows-\${arch}.\${ext}
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: MD Reader

portable:
  artifactName: MD-Reader-Portable-Windows-\${arch}.\${ext}

linux:
  category: Office
  mimeTypes:
    - text/markdown
    - text/x-markdown
  artifactName: MD-Reader-Linux-\${arch}.\${ext}
  target:
    - target: AppImage
      arch: [x64]
    - target: deb
      arch: [x64]
`;

  const workflowYml = `name: Build & Publish Desktop Installers

on:
  workflow_dispatch:
  push:
    branches:
      - main
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  build:
    strategy:
      fail-fast: false
      matrix:
        include:
          - os: windows-latest
            platform: win
            command: npm run electron:build:win
          - os: macos-latest
            platform: mac
            command: npm run electron:build:mac
          - os: ubuntu-latest
            platform: linux
            command: npm run electron:build:linux
    runs-on: \${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm install && npm install --no-save electron electron-builder
      - run: \${{ matrix.command }}
      - uses: actions/upload-artifact@v4
        with:
          name: md-reader-\${{ matrix.platform }}
          path: |
            release/**/*.exe
            release/**/*.dmg
            release/**/*.zip
            release/**/*.AppImage
            release/**/*.deb

  publish-release:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          path: all-installers
          merge-multiple: true
      - uses: softprops/action-gh-release@v2
        with:
          tag_name: \${{ startsWith(github.ref, 'refs/tags/') && github.ref_name || 'latest' }}
          name: \${{ startsWith(github.ref, 'refs/tags/') && github.ref_name || 'Latest Desktop Build' }}
          files: |
            all-installers/**/*.exe
            all-installers/**/*.dmg
            all-installers/**/*.zip
            all-installers/**/*.AppImage
            all-installers/**/*.deb
          generate_release_notes: true
`;

  const readme = `# MD Reader — Native Desktop Installers & Default .md File Handler

This project is configured with Electron + electron-builder so compiled installers register **MD Reader** as a native handler for \`.md\`, \`.markdown\`, \`.mdx\`, \`.mdown\`, and \`.mkd\` files on Windows, macOS, and Linux.

## Option A — Build Your Real .exe / .dmg / .AppImage Locally
Requires Node.js 20+:
\`\`\`bash
npm install
npm install -D electron electron-builder

# Windows (produces MD-Reader-Setup-Windows-x64.exe & portable .exe)
npm run electron:build:win

# macOS (produces MD-Reader-macOS-arm64.dmg & x64 .dmg)
npm run electron:build:mac

# Linux (produces MD-Reader-Linux-x64.AppImage & .deb)
npm run electron:build:linux
\`\`\`
Find your compiled installers inside \`release/\`.

## Option B — Auto-Build Real .exe / .dmg / .AppImage on GitHub
1. Push this repository to GitHub.
2. In your GitHub repository, open **Actions → New workflow → set up a workflow yourself**, name it \`.github/workflows/build-desktop.yml\`, and paste the contents of \`electron/github-actions-build-desktop.yml\`.
3. Commit the workflow on GitHub — it immediately builds Windows \`.exe\`, macOS \`.dmg\`, and Linux \`.AppImage\` / \`.deb\` installers and publishes them to **GitHub Releases** on every push to \`main\` or \`v*\` tag.
4. Set \`VITE_GITHUB_REPO=your-username/your-repo\` in your deployment environment so the Landing Page buttons download the \`.exe\`, \`.dmg\`, and \`.AppImage\` files directly in one click.

## Setting MD Reader as Default App for .md Files
- **Windows**: Run \`MD-Reader-Setup-Windows-x64.exe\`. Right-click any \`.md\` file → **Open with** → **MD Reader** → **Always**, or use **File → Set as Default .md App** inside the app.
- **macOS**: Drag MD Reader to Applications, right-click any \`.md\` file → **Get Info** → **Open with: MD Reader** → **Change All…**.
- **Linux**: Install the \`.deb\` package or run \`xdg-mime default md-reader.desktop text/markdown\`.
`;

  return {
    'electron/main.cjs': mainCjs,
    'electron/preload.cjs': preloadCjs,
    'electron-builder.yml': builderYml,
    '.github/workflows/build-desktop.yml': workflowYml,
    'BUILD-DESKTOP.md': readme,
  };
}

function getPlatformBuildScript(platform: DesktopPlatform): { name: string; content: string } {
  if (platform === 'win') {
    return {
      name: 'build-windows.bat',
      content: `@echo off
echo Installing dependencies and Electron builder...
call npm install
call npm install -D electron electron-builder
echo Building MD Reader Windows Installer (.exe with .md file association)...
call npm run electron:build:win
echo Done! Find MD-Reader-Setup-Windows-x64.exe inside the release\\ directory.
pause
`,
    };
  }
  if (platform === 'mac') {
    return {
      name: 'build-macos.command',
      content: `#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "Installing dependencies and Electron builder..."
npm install
npm install -D electron electron-builder
echo "Building MD Reader macOS Disk Image (.dmg with .md file association)..."
npm run electron:build:mac
echo "Done! Find MD-Reader-macOS-*.dmg inside the release/ directory."
`,
    };
  }
  return {
    name: 'build-linux.sh',
    content: `#!/bin/bash
set -e
echo "Installing dependencies and Electron builder..."
npm install
npm install -D electron electron-builder
echo "Building MD Reader Linux AppImage & Debian package (.deb)..."
npm run electron:build:linux
echo "Done! Find MD-Reader-Linux-x64.AppImage and .deb inside the release/ directory."
`,
  };
}

export async function downloadBuildKitZip(platform: DesktopPlatform): Promise<string> {
  const meta = DESKTOP_PLATFORMS[platform];
  const files = generateElectronFiles();
  const script = getPlatformBuildScript(platform);
  const zip = new JSZip();

  Object.entries(files).forEach(([filePath, content]) => {
    zip.file(filePath, content);
  });

  zip.file(script.name, script.content);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = meta.zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return meta.zipName;
}

export const downloadDesktopPackage = downloadBuildKitZip;

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
