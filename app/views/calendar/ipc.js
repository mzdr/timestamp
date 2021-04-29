const { ipcRenderer } = require('electron');

const CALENDAR_GET_CALENDAR = 'calendar.getCalendar';
const CALENDAR_GET_DATE = 'calendar.getDate';
const CALENDAR_HIDE = 'calendar.hide';

module.exports = {
  CALENDAR_GET_CALENDAR,
  CALENDAR_GET_DATE,
  CALENDAR_HIDE,

  api: {
    getCalendar: (payload) => ipcRenderer.invoke(CALENDAR_GET_CALENDAR, payload),
    getDate: (payload) => ipcRenderer.invoke(CALENDAR_GET_DATE, payload),
    hide: () => ipcRenderer.send(CALENDAR_HIDE),
    on: (channel, fn) => ipcRenderer.on(`calendar.${channel}`, fn),
  },
};
