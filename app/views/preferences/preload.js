const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('preferences', {
  get: (key) => ipcRenderer.invoke('get', key),
  on: (channel, fn) => ipcRenderer.on(channel, fn),
  resizeWindow: (payload) => ipcRenderer.send('resizeWindow', payload),
  set: (key, value) => ipcRenderer.send('set', key, value),
});

contextBridge.exposeInMainWorld('app', {
  quit: () => ipcRenderer.send('quit'),
  restart: () => ipcRenderer.send('restart'),
  translate: (key, options) => ipcRenderer.invoke('translate', key, options),
});
