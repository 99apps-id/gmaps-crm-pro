/**
 * Preload - jembatan aman renderer <-> main (contextIsolation).
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  windowControl: (action) => ipcRenderer.invoke('window-control', action),
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
});
