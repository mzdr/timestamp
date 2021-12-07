const { ipcRenderer } = require('electron');

const CALENDAR_GET_CALENDAR = 'calendar.get-calendar';
const CALENDAR_GET_DATE = 'calendar.get-date';
const CALENDAR_GET_WEEKDAYS = 'calendar.get-weekdays';
const CALENDAR_HIDE = 'calendar.hide';
const CALENDAR_SHOW = 'calendar.show';

module.exports = {
  CALENDAR_GET_CALENDAR,
  CALENDAR_GET_DATE,
  CALENDAR_GET_WEEKDAYS,
  CALENDAR_HIDE,
  CALENDAR_SHOW,

  api: {
    getCalendar: (payload) => ipcRenderer.invoke(CALENDAR_GET_CALENDAR, payload),
    getDate: (payload) => ipcRenderer.invoke(CALENDAR_GET_DATE, payload),
    getWeekdays: () => ipcRenderer.invoke(CALENDAR_GET_WEEKDAYS),
    hide: () => ipcRenderer.send(CALENDAR_HIDE),
    on: (channel, fn) => ipcRenderer.on(`calendar.${channel}`, fn),
    show: () => ipcRenderer.send(CALENDAR_SHOW),
  },
};
