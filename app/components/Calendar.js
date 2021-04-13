const { ipcMain } = require('electron');
const datefns = require('date-fns');

const { getAbsolutePath } = require('../utils');
const Window = require('./Window');

class Calendar {
  constructor({ locale }) {
    this.locale = locale.getObject();

    ipcMain.handle('getDate', this.getDate.bind(this));
    ipcMain.handle('getCalendar', this.getCalendar.bind(this));

    this.window = new Window({
      sourceFile: getAbsolutePath('views', 'calendar', 'calendar.html'),
      webPreferences: {
        preload: getAbsolutePath('views', 'calendar', 'preload.js'),
      },
    });

    console.log('Calendar module created.');
  }

  getDate(event, payload = {}) {
    const { locale } = this;

    const {
      date, format, set, diff,
    } = payload;

    let final = date || datefns.startOfToday();

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
      days.push({
        day: datefns.addDays(firstWeek, i),
        previousMonth: true,
      });
    }

    for (let i = 0; i < totalDays; i += 1) {
      const day = datefns.addDays(startOfMonth, i);
      const isToday = datefns.isToday(day);

      days.push({ day, isToday });
    }

    for (let i = 1; i <= nextMonthDays; i += 1) {
      days.push({
        day: datefns.addDays(lastDayOfMonth, i),
        nextMonth: true,
      });
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
