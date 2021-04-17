const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('calendar', {
  close: () => ipcRenderer.send('close'),
  getCalendar: (payload) => ipcRenderer.invoke('getCalendar', payload),
  getDate: (payload) => ipcRenderer.invoke('getDate', payload),
  on: (channel, fn) => ipcRenderer.on(channel, fn),
  resizeWindow: (payload) => ipcRenderer.send('resizeWindow', payload),
});

contextBridge.exposeInMainWorld('app', {
  quit: () => ipcRenderer.send('quit'),
  showPreferences: () => ipcRenderer.send('showPreferences'),
});
