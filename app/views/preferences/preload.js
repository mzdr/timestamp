const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('preferences', {
  resizeWindow: (payload) => ipcRenderer.send('resizeWindow', payload),
  set: (key, value) => ipcRenderer.send('set', key, value),
  get: (key) => ipcRenderer.invoke('get', key),
});

contextBridge.exposeInMainWorld('app', {
  quit: () => ipcRenderer.send('quit'),
  translate: (key, options) => ipcRenderer.invoke('translate', key, options),
});
