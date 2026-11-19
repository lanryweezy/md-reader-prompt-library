const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
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
  // In packaged Electron apps argv starts at index 1; in dev (`electron . file.md`) skip script arg
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

// Single-instance lock so double-clicking .md files opens them in the active window
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    const filePaths = extractFilePathsFromArgv(commandLine);
    filePaths.forEach(enqueueOrDeliverFile);

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// macOS: Handle double-clicking or "Open With" on .md files from Finder
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  enqueueOrDeliverFile(filePath);
});

// Capture files passed via command line on cold start (Windows & Linux)
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
      message:
        'Opened Windows Default Apps. Search for ".md" and select MD Reader as your default app.',
    };
  }

  if (process.platform === 'darwin') {
    return {
      openedSettings: false,
      platform: 'darwin',
      message:
        'In Finder, right-click any .md file → Get Info → Open with: MD Reader → click "Change All…".',
    };
  }

  // Linux: register via xdg-mime when available
  return new Promise((resolve) => {
    execFile('xdg-mime', ['default', 'md-reader.desktop', 'text/markdown'], (err) => {
      if (err) {
        resolve({
          openedSettings: false,
          platform: 'linux',
          message:
            'Right-click any .md file → Properties → Open With → select MD Reader and click "Set as default".',
        });
      } else {
        resolve({
          openedSettings: true,
          platform: 'linux',
          message: 'Registered MD Reader as the default handler for text/markdown files.',
        });
      }
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

  // Open external links in default system browser
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

function createAppMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Set as Default .md App…',
          click: () => {
            openDefaultAppsGuide();
          },
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  createAppMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Native IPC: Drain any .md files that launched the app from OS double-click / "Open With"
ipcMain.handle('file:getPendingOpened', async () => {
  const drained = pendingOpenedFiles.splice(0, pendingOpenedFiles.length);
  return drained;
});

// Native IPC: Open OS Default Apps settings / instructions for .md files
ipcMain.handle('app:openDefaultAppsSettings', async () => {
  return openDefaultAppsGuide();
});

// Native IPC: Open one or more Markdown files from local disk
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

// Native IPC: Recursively open a local folder of Markdown files
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
      } else if (
        entry.isFile() &&
        SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) &&
        entry.name.toLowerCase() !== '.txt'
      ) {
        files.push({
          path: fullPath,
          name: entry.name,
          content: fs.readFileSync(fullPath, 'utf-8'),
        });
      }
    }
  }

  scanDirectory(dirPath);
  return {
    folderPath: dirPath,
    folderName: path.basename(dirPath),
    files,
  };
});

// Native IPC: Save Markdown content directly to disk
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
  return {
    success: true,
    path: targetPath,
    name: path.basename(targetPath),
  };
});
