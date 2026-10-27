const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', {
  locale: process.argv.find(arg=>arg.startsWith('--jonis-locale='))?.slice('--jonis-locale='.length) || 'en',
  capture: (action, ...args) => { if (!['gpu-info','folder','choose','open','image','begin','chunk','finish','closed'].includes(action)) throw Error('Acción inválida'); return ipcRenderer.invoke('capture:' + action, ...args); },
  onExportStatus: callback => ipcRenderer.on('capture:export-status', (_event, name) => callback(name)),
  onCaptureClose: callback => ipcRenderer.on('capture:closing', callback),
  fullscreen: value => ipcRenderer.invoke('fullscreen', value),
  awake: value => ipcRenderer.invoke('awake', value),
  onFullscreen: callback => ipcRenderer.on('fullscreen', (_event, value) => callback(value))
});
