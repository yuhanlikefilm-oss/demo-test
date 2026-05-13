const { app, BrowserWindow, screen, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const ASSET_DIRS = [path.join(__dirname, 'asset'), path.join(__dirname, 'assets')];
const FILE_NAME = 'husky-sheet.png';

function ensureAssetDirs() {
  for (const dir of ASSET_DIRS) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

function findSpritePath() {
  for (const dir of ASSET_DIRS) {
    const p = path.join(dir, FILE_NAME);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const win = new BrowserWindow({
    width: 300,
    height: 260,
    x: Math.max(0, width - 340),
    y: Math.max(0, height - 300),
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile('index.html');
}

ipcMain.handle('resolve-husky-sheet', async () => {
  const found = findSpritePath();
  return {
    ok: Boolean(found),
    fileUrl: found ? pathToFileURL(found).href : null,
    searched: ASSET_DIRS.map((d) => path.join(d, FILE_NAME)),
  };
});

ipcMain.handle('pick-husky-sheet', async () => {
  ensureAssetDirs();
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: '选择哈士奇精灵图',
    properties: ['openFile'],
    filters: [{ name: 'Image', extensions: ['png', 'webp'] }],
  });
  if (canceled || !filePaths[0]) return { ok: false, reason: 'canceled' };

  const target = path.join(ASSET_DIRS[0], FILE_NAME);
  fs.copyFileSync(filePaths[0], target);
  return { ok: true, fileUrl: pathToFileURL(target).href, target };
});

app.whenReady().then(() => {
  ensureAssetDirs();
  createWindow();
});
app.on('window-all-closed', () => app.quit());
