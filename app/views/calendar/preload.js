const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('calendar', {
  getCalendar: (payload) => ipcRenderer.invoke('getCalendar', payload),
  getDate: (payload) => ipcRenderer.invoke('getDate', payload),
  quit: () => ipcRenderer.send('quit'),
  resizeWindow: (payload) => ipcRenderer.send('resizeWindow', payload),
  showPreferences: () => ipcRenderer.send('showPreferences'),
});
