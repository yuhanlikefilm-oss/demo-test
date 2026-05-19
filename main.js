const { app, BrowserWindow, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let win;
let tray;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    width: 320,
    height: 260,
    x: Math.max(0, width - 360),
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
  win.on('closed', () => {
    win = null;
  });
}

function setAlwaysOnTop(enabled) {
  if (!win) return;
  win.setAlwaysOnTop(enabled, 'screen-saver');
}

function createTray() {
  const iconPath = path.join(__dirname, 'asset', 'husky', 'idle.png');
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 18, height: 18 });
  tray = new Tray(trayIcon);
  tray.setToolTip('Husky Desktop Pet');

  const menu = Menu.buildFromTemplate([
    {
      label: '显示/隐藏桌宠',
      click: () => {
        if (!win) return;
        if (win.isVisible()) win.hide();
        else win.show();
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
        if (!win) return;
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        win.setPosition(Math.max(0, width - 360), Math.max(0, height - 300));
        win.show();
      },
    },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() },
  ]);

  tray.setContextMenu(menu);
  tray.on('double-click', () => {
    if (!win) return;
    win.show();
    win.focus();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});
