const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('calendar', {
  getCalendar: (payload) => ipcRenderer.invoke('getCalendar', payload),
  getDate: (payload) => ipcRenderer.invoke('getDate', payload),
  resizeWindow: (payload) => ipcRenderer.send('resizeWindow', payload),
});

contextBridge.exposeInMainWorld('app', {
  quit: () => ipcRenderer.send('quit'),
  showPreferences: () => ipcRenderer.send('showPreferences'),
});
