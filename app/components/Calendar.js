const { ipcMain } = require('electron');
const { resolve } = require('path');
const datefns = require('date-fns');

const Window = require('./Window');

const {
  CALENDAR_GET_CALENDAR,
  CALENDAR_GET_DATE,
  CALENDAR_GET_WEEKDAYS,
  CALENDAR_HIDE,
  CALENDAR_SHOW,
} = require('../views/calendar/ipc');

class Calendar {
  constructor({ locale, logger }) {
    this.logger = logger;
    this.locale = locale.getObject();

    ipcMain.handle(CALENDAR_GET_CALENDAR, this.getCalendar.bind(this));
    ipcMain.handle(CALENDAR_GET_DATE, this.getDate.bind(this));
    ipcMain.handle(CALENDAR_GET_WEEKDAYS, this.getWeekdays.bind(this));

    ipcMain.on(CALENDAR_HIDE, () => this.window.hide());
    ipcMain.on(CALENDAR_SHOW, () => this.window.show());

    this.window = new Window({
      name: 'calendar',
      sourceFile: resolve(__dirname, '../views/calendar/calendar.html'),
      webPreferences: {
        preload: resolve(__dirname, '../views/calendar/preload.js'),
        backgroundThrottling: false,
      },
    });

    this.logger.debug('Calendar module created.');
  }

  getDate(event, payload = {}) {
    const { locale } = this;

    const {
      date,
      format,
      set,
      diff,
    } = payload;

    let final = date || new Date();

    if (set) {
      final = datefns.set(final, set);
    }

    if (diff) {
      final = datefns.add(final, diff); // date-fns.add() supports negative numbers as well
    }

    if (format) {
      try {
        return datefns.format(final, format, { locale });
      } catch (e) {
        return '#invalid format#';
      }
    }

    return final;
  }

  getCalendar(event, payload) {
    const { locale } = this;
    const year = this.getDate(null, payload);
    const startOfYear = datefns.startOfYear(year);
    const endOfYear = datefns.endOfYear(year);
    const totalDays = datefns.differenceInCalendarDays(endOfYear, startOfYear);

    const days = [];

    for (let i = 0; i <= totalDays; i += 1) {
      const date = datefns.addDays(startOfYear, i);
      const week = datefns.getWeek(date, { locale });
      const weekday = datefns.getDay(date);
      const day = datefns.format(date, 'd', { locale });

      days.push({
        date,
        day,
        week,
        weekday,
      });
    }

    return days;
  }

  getWeekdays() {
    const { locale } = this;
    const startOfWeek = datefns.startOfWeek(new Date(), { locale });
    const startIndex = datefns.getDay(startOfWeek);
    const weekdays = [];

    for (let i = 0; i < 7; i += 1) {
      const weekday = datefns.addDays(startOfWeek, i);

      weekdays.push(
        datefns.format(weekday, 'EEE', { locale }),
      );
    }

    return {
      startIndex,
      weekdays,
    };
  }
}

module.exports = Calendar;
