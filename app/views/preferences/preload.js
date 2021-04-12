const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('preferences', {
  resizeWindow: (payload) => ipcRenderer.send('resizeWindow', payload),
});

contextBridge.exposeInMainWorld('app', {
  quit: () => ipcRenderer.send('quit'),
  translate: (key) => ipcRenderer.invoke('translate', key),
});
