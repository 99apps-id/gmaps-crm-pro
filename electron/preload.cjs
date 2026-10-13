/**
 * Preload - jembatan aman renderer <-> main (contextIsolation).
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  windowControl: (action) => ipcRenderer.invoke('window-control', action),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  onProtocolActivate: (cb) => {
    if (typeof cb !== 'function') return () => {};
    const handler = (_evt, data) => cb(data);
    ipcRenderer.on('gcrm:protocol-activate', handler);
    return () => ipcRenderer.removeListener('gcrm:protocol-activate', handler);
  },
  protocolPending: () => ipcRenderer.invoke('protocol-pending')
});
