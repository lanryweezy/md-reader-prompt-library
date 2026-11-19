const { contextBridge, ipcRenderer } = require('electron');

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
