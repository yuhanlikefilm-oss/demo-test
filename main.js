const { app, BrowserWindow, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let win;
let tray;

function getWorkAreaPosition() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  return { x: Math.max(0, width - 360), y: Math.max(0, height - 300) };
}

function createWindow() {
  const pos = getWorkAreaPosition();
  win = new BrowserWindow({
    width: 320,
    height: 260,
    x: pos.x,
    y: pos.y,
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

  win.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      win.hide();
    }
  });
}

function ensureWindowVisible() {
  if (!win || win.isDestroyed()) {
    createWindow();
    return;
  }
  win.show();
  win.focus();
}

function setAlwaysOnTop(enabled) {
  if (!win || win.isDestroyed()) return;
  win.setAlwaysOnTop(enabled, 'screen-saver');
}

function createTray() {
  const iconPath = path.join(__dirname, 'asset', 'husky', 'idle.png');
  const fallback = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAQ0lEQVR4nGNgGAXUB8Qw/P//PwMDA8N/RkYGeGJjY2P4z8DAwPBPQ0OD4T8DAwPjPwMDg+E/AwMD4z8DAwMAAJa1C4QY4A6xAAAAAElFTkSuQmCC');
  const trayImage = fs.existsSync(iconPath)
    ? nativeImage.createFromPath(iconPath).resize({ width: 18, height: 18 })
    : fallback;

  tray = new Tray(trayImage);
  tray.setToolTip('Husky Desktop Pet');

  const menu = Menu.buildFromTemplate([
    { label: '显示桌宠', click: () => ensureWindowVisible() },
    {
      label: '隐藏桌宠',
      click: () => {
        if (win && !win.isDestroyed()) win.hide();
      },
    },
    {
      label: '始终置顶',
      type: 'checkbox',
      checked: false,
      click: (item) => setAlwaysOnTop(item.checked),
    },
    {
      label: '重置位置到右下角',
      click: () => {
        ensureWindowVisible();
        const pos = getWorkAreaPosition();
        win.setPosition(pos.x, pos.y);
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(menu);
  tray.on('click', () => ensureWindowVisible());
  tray.on('double-click', () => ensureWindowVisible());
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});
