const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('petAPI', {
  pickHuskySheet: () => ipcRenderer.invoke('pick-husky-sheet'),
  resolveHuskySheet: () => ipcRenderer.invoke('resolve-husky-sheet'),
});
