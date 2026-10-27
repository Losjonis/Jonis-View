const { app, BrowserWindow, ipcMain, session, powerSaveBlocker } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const page = pathToFileURL(path.join(__dirname, '../src/index.html')).href;
let win, blocker;
function keepAwake(active) {
  if (active && blocker === undefined) blocker = powerSaveBlocker.start('prevent-display-sleep');
  if (!active && blocker !== undefined) { powerSaveBlocker.stop(blocker); blocker = undefined; }
}
app.whenReady().then(() => {
  session.defaultSession.setPermissionCheckHandler((wc, permission) => wc === win?.webContents && wc.getURL() === page && ['media', 'speaker-selection'].includes(permission));
  session.defaultSession.setPermissionRequestHandler((wc, permission, callback) => callback(wc === win?.webContents && wc.getURL() === page && ['media', 'speaker-selection'].includes(permission)));
  win = new BrowserWindow({ width: 1180, height: 760, minWidth: 680, minHeight: 440, backgroundColor: '#1c191d', title: 'Jonis View', autoHideMenuBar: true, webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false } });
  win.setMenu(null);
  win.setIcon(path.join(__dirname, '../src/icon.png'));
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => { if (url !== page) event.preventDefault(); });
  win.on('enter-full-screen', () => win.webContents.send('fullscreen', true));
  win.on('leave-full-screen', () => win.webContents.send('fullscreen', false));
  win.on('closed', () => keepAwake(false));
  ipcMain.handle('fullscreen', (event, value) => { if (event.sender !== win.webContents) return; win.setFullScreen(Boolean(value)); return win.isFullScreen(); });
  ipcMain.handle('awake', (event, value) => { if (event.sender === win.webContents) keepAwake(Boolean(value)); });
  win.loadURL(page);
});
app.on('window-all-closed', () => app.quit());
