const { contextBridge } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

contextBridge.exposeInMainWorld('petPaths', {
  resolveAsset: (relativePath) => {
    const clean = String(relativePath || '').replace(/^\/+/, '');
    const absPath = path.join(__dirname, clean);
    return pathToFileURL(absPath).href;
  },
});
