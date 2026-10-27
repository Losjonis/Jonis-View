const { app, BrowserWindow, Menu, ipcMain, session, powerSaveBlocker, systemPreferences } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const page = pathToFileURL(path.join(__dirname, '../src/index.html')).href;
let win, blocker;
function keepAwake(active) {
  if (active && blocker === undefined) blocker = powerSaveBlocker.start('prevent-display-sleep');
  if (!active && blocker !== undefined) { powerSaveBlocker.stop(blocker); blocker = undefined; }
}
function createWindow() {
  win = new BrowserWindow({ width: 1180, height: 760, minWidth: 680, minHeight: 440, backgroundColor: '#f4f2f4', title: 'Jonis View', ...(process.platform === 'darwin' ? { titleBarStyle: 'hiddenInset', trafficLightPosition: { x: 18, y: 22 }, vibrancy: 'sidebar' } : {}), webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false } });
  if (process.platform !== 'darwin') win.setMenu(null);
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => { if (url !== page) event.preventDefault(); });
  win.on('enter-full-screen', () => win.webContents.send('fullscreen', true));
  win.on('leave-full-screen', () => win.webContents.send('fullscreen', false));
  win.on('closed', () => { keepAwake(false); win = null; });
  win.loadURL(page);
}
app.whenReady().then(() => {
  const allowed = (wc, permission) => wc === win?.webContents && wc.getURL() === page && ['media', 'speaker-selection'].includes(permission);
  session.defaultSession.setPermissionCheckHandler(allowed);
  session.defaultSession.setPermissionRequestHandler((wc, permission, callback) => callback(allowed(wc, permission)));
  ipcMain.handle('fullscreen', (event, value) => { if (event.sender !== win?.webContents) return; win.setFullScreen(Boolean(value)); return win.isFullScreen(); });
  ipcMain.handle('awake', (event, value) => { if (event.sender === win?.webContents) keepAwake(Boolean(value)); });
  ipcMain.handle('media-access', async (event, kind) => {
    if (event.sender !== win?.webContents || !['camera', 'microphone'].includes(kind)) return false;
    return process.platform !== 'darwin' || systemPreferences.askForMediaAccess(kind);
  });
  if (process.platform === 'darwin') Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Jonis View', submenu: [{ role: 'about' }, { type: 'separator' }, { label: 'Ajustes…', accelerator: 'Cmd+,', click: () => { if (!win) { createWindow(); win.webContents.once('did-finish-load', () => win?.webContents.send('settings')); } else { win.show(); win.webContents.send('settings'); } } }, { type: 'separator' }, { role: 'services' }, { type: 'separator' }, { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' }, { type: 'separator' }, { role: 'quit' }] },
    { role: 'editMenu' }, { label: 'Visualización', submenu: [{ role: 'togglefullscreen' }] }, { role: 'windowMenu' }
  ]));
  createWindow();
  app.on('activate', () => { if (!win) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('before-quit', () => keepAwake(false));
