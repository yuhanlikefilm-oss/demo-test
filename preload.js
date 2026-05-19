const { contextBridge } = require('electron');
const path = require('path');

contextBridge.exposeInMainWorld('petPaths', {
  resolveAsset: (relativePath) => {
    const clean = String(relativePath || '').replace(/^\/+/, '');
    return `file://${path.join(__dirname, clean)}`;
  },
});
