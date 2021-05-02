const { ipcMain } = require('electron');
const { resolve } = require('path');
const datefns = require('date-fns');

const Window = require('./Window');

const {
  CALENDAR_BACKGROUND_CHANGED,
  CALENDAR_GET_CALENDAR,
  CALENDAR_GET_DATE,
  CALENDAR_HIDE,
  CALENDAR_SHOW,
} = require('../views/calendar/ipc');

class Calendar {
  constructor({ locale, logger }) {
    this.logger = logger;
    this.locale = locale.getObject();

    ipcMain.handle(CALENDAR_GET_CALENDAR, this.getCalendar.bind(this));
    ipcMain.handle(CALENDAR_GET_DATE, this.getDate.bind(this));

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

  setBackground(background) {
    this
      .window
      .getWebContents()
      .send(CALENDAR_BACKGROUND_CHANGED, background);
  }

  getDate(event, payload = {}) {
    const { locale } = this;

    const {
      date, format, set, diff,
    } = payload;

    let final = date || new Date();

    if (diff) {
      final = datefns.add(final, diff); // date-fns.add() supports negative numbers as well
    }

    if (set) {
      final = datefns.set(final, set);
    }

    if (format) {
      return datefns.format(final, format, { locale });
    }

    return final;
  }

  getCalendar(event, { now }) {
    const { locale } = this;
    const weekdays = [];
    const weeks = [];
    const days = [];

    const totalDays = datefns.getDaysInMonth(now);
    const lastDayOfMonth = datefns.lastDayOfMonth(now);
    const startOfMonth = datefns.startOfMonth(now);
    const firstWeek = datefns.startOfWeek(startOfMonth, { locale });
    const lastWeek = datefns.endOfWeek(lastDayOfMonth, { locale });
    const previousMonthDays = datefns.differenceInCalendarDays(startOfMonth, firstWeek);
    const nextMonthDays = datefns.differenceInCalendarDays(lastWeek, lastDayOfMonth);

    for (let i = 0; i < previousMonthDays; i += 1) {
      const day = datefns.addDays(firstWeek, i);
      const isToday = datefns.isToday(day);
      const previousMonth = true;

      days.push({ day, isToday, previousMonth });
    }

    for (let i = 0; i < totalDays; i += 1) {
      const day = datefns.addDays(startOfMonth, i);
      const isToday = datefns.isToday(day);

      days.push({ day, isToday });
    }

    for (let i = 1; i <= nextMonthDays; i += 1) {
      const day = datefns.addDays(lastDayOfMonth, i);
      const isToday = datefns.isToday(day);
      const nextMonth = true;

      days.push({ day, isToday, nextMonth });
    }

    for (let i = 0; i < 7; i += 1) {
      weekdays.push(datefns.format(days[i].day, 'EEE', { locale }));
    }

    for (let i = 0; i < days.length; i += 7) {
      weeks.push(datefns.getWeek(days[i].day, { locale }));
    }

    return {
      totalDays,
      lastDayOfMonth,
      startOfMonth,
      firstWeek,
      lastWeek,
      previousMonthDays,
      nextMonthDays,
      weekdays,
      weeks,
      days,
    };
  }
}

module.exports = Calendar;
