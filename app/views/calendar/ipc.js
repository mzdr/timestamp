const { ipcRenderer } = require('electron');

const CALENDAR_GET_CALENDAR = 'calendar.get-calendar';
const CALENDAR_GET_DATE = 'calendar.get-date';
const CALENDAR_GET_MONTHS = 'calendar.get-months';
const CALENDAR_HIDE = 'calendar.hide';
const CALENDAR_IS_SAME_HOUR = 'calendar.is-same-hour';
const CALENDAR_SHOW = 'calendar.show';

module.exports = {
  CALENDAR_GET_CALENDAR,
  CALENDAR_GET_DATE,
  CALENDAR_GET_MONTHS,
  CALENDAR_HIDE,
  CALENDAR_IS_SAME_HOUR,
  CALENDAR_SHOW,

  api: {
    getCalendar: (payload) => ipcRenderer.invoke(CALENDAR_GET_CALENDAR, payload),
    getDate: (payload) => ipcRenderer.invoke(CALENDAR_GET_DATE, payload),
    getMonths: () => ipcRenderer.invoke(CALENDAR_GET_MONTHS),
    hide: () => ipcRenderer.send(CALENDAR_HIDE),
    isSameHour: (...payload) => ipcRenderer.invoke(CALENDAR_IS_SAME_HOUR, ...payload),
    on: (channel, fn) => ipcRenderer.on(`calendar.${channel}`, fn),
    show: () => ipcRenderer.send(CALENDAR_SHOW),
  },
};
