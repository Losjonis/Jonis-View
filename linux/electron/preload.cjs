const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', {
  fullscreen: value => ipcRenderer.invoke('fullscreen', value),
  awake: value => ipcRenderer.invoke('awake', value),
  onFullscreen: callback => ipcRenderer.on('fullscreen', (_event, value) => callback(value))
});
