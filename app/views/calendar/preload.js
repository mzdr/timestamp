const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('calendar', {
  getDate: (payload) => ipcRenderer.invoke('getDate', payload),
  getCalendar: (payload) => ipcRenderer.invoke('getCalendar', payload),
  resizeWindow: (payload) => ipcRenderer.send('resizeWindow', payload),
});
