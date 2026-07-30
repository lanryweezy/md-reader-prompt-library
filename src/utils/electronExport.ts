export interface ElectronFiles {
  'main.js': string;
  'preload.js': string;
  'package.json': string;
  'README-ELECTRON.md': string;
}

export function generateElectronFiles(): ElectronFiles {
  const mainJs = `// Electron Main Process for Markdown Reader & Prompt Library
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    icon: path.join(__dirname, 'assets/icon.png'),
  });

  // Load production build index.html or local dev server
  const startUrl = process.env.ELECTRON_START_URL || \`file://\${path.join(__dirname, 'dist/index.html')}\`;
  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Native IPC Handlers for .md File System operations
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] }],
  });
  if (canceled || filePaths.length === 0) return null;

  return filePaths.map((fp) => {
    const content = fs.readFileSync(fp, 'utf-8');
    const name = path.basename(fp);
    return { path: fp, name, content };
  });
});

ipcMain.handle('dialog:openFolder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  if (canceled || filePaths.length === 0) return null;

  const dirPath = filePaths[0];
  const files = [];

  function readDirRecursive(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory() && !item.startsWith('.')) {
        readDirRecursive(fullPath);
      } else if (stat.isFile() && (item.endsWith('.md') || item.endsWith('.markdown'))) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        files.push({ path: fullPath, name: item, content });
      }
    }
  }

  readDirRecursive(dirPath);
  return { folderPath: dirPath, folderName: path.basename(dirPath), files };
});

ipcMain.handle('file:save', async (event, { filePath, content }) => {
  let targetPath = filePath;
  if (!targetPath) {
    const { canceled, filePath: chosenPath } = await dialog.showSaveDialog(mainWindow, {
      filters: [{ name: 'Markdown File', extensions: ['md'] }],
    });
    if (canceled) return false;
    targetPath = chosenPath;
  }

  fs.writeFileSync(targetPath, content, 'utf-8');
  return { success: true, path: targetPath, name: path.basename(targetPath) };
});
`;

  const preloadJs = `// Electron Preload Bridge
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  openFiles: () => ipcRenderer.invoke('dialog:openFile'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  saveFile: (data) => ipcRenderer.invoke('file:save', data),
});
`;

  const packageJson = JSON.stringify(
    {
      name: 'markdown-reader-desktop',
      version: '1.0.0',
      description: 'Native Desktop Markdown Reader & Prompt Library powered by Electron',
      main: 'main.js',
      scripts: {
        start: 'electron .',
        'build:web': 'vite build',
        'pack:mac': 'electron-builder --mac',
        'pack:win': 'electron-builder --win',
        'pack:linux': 'electron-builder --linux',
      },
      dependencies: {
        electron: '^30.0.0',
      },
      devDependencies: {
        'electron-builder': '^24.13.3',
      },
      build: {
        appId: 'com.markdownreader.app',
        productName: 'Markdown Reader & Prompt Library',
        files: ['main.js', 'preload.js', 'dist/**/*'],
        mac: {
          category: 'public.app-category.productivity',
        },
        win: {
          target: ['nsis', 'portable'],
        },
      },
    },
    null,
    2
  );

  const readme = `# 💻 Running as Native Electron Desktop App

You can package and run this app locally on macOS, Windows, or Linux using Electron!

## Quick Start Steps:

1. **Extract / Save Project Files**:
   Ensure you have the full source directory containing \`package.json\`, \`main.js\`, \`preload.js\`, and \`src/\`.

2. **Install Dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Build Web App Bundle**:
   \`\`\`bash
   npm run build:web
   \`\`\`

4. **Launch Desktop App in Dev Mode**:
   \`\`\`bash
   npm start
   \`\`\`

5. **Package for Executable (.exe, .dmg, .AppImage)**:
   \`\`\`bash
   # For Windows
   npm run pack:win

   # For Mac
   npm run pack:mac

   # For Linux
   npm run pack:linux
   \`\`\`

---
Enjoy your native desktop Markdown Reader & Prompt Library!
`;

  return {
    'main.js': mainJs,
    'preload.js': preloadJs,
    'package.json': packageJson,
    'README-ELECTRON.md': readme,
  };
}

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
