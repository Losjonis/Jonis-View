const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  fullscreen: value => ipcRenderer.invoke('fullscreen', value),
  awake: value => ipcRenderer.invoke('awake', value),
  requestMediaAccess: kind => ipcRenderer.invoke('media-access', kind),
  onFullscreen: callback => ipcRenderer.on('fullscreen', (_event, value) => callback(value)),
  onSettings: callback => ipcRenderer.on('settings', () => callback())
});
