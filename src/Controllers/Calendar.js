const Pikaday = require('pikaday');
const Electron = require('electron');

class Calendar
{
    /**
     * Creates an instance of the Calendar controller.
     *
     * @return {Calendar}
     */
    constructor()
    {
        // Get access to app from main process
        this.app = Electron.remote.getGlobal('App');

        // Add class if in dark mode
        if (Electron.remote.systemPreferences.isDarkMode()) {
            document.documentElement.classList.add('dark-mode');
        }

        let months = [];
        let weekdays = [];
        let weekdaysShort = [];
        let date = new Date(2015, 0);

        // collect translations for months
        for (var i = 0; i < 12; i++) {
            date.setMonth(i);
            months.push(date.toLocaleString(this.app.locale, {
                month: 'long'
            }));
        }

        // march the first in 2015 is a sunday
        date.setMonth(2, 1);

        // collect translations for weekdays
        for (var i = 1; i < 8; i++) {
            date.setMonth(date.getMonth(), i);

            weekdays.push(date.toLocaleString(this.app.locale, {
                weekday: 'long'
            }));

            weekdaysShort.push(date.toLocaleString(this.app.locale, {
                weekday: 'short'
            }));
        }

        let picker = new Pikaday({
            field: document.createElement('div'),
            bound: false,
            container: document.querySelector('[data-pikaday]'),
            showWeekNumber: false,
            showDaysInNextAndPreviousMonths: true,
            onDraw: this.onDraw,
            i18n: {
                previousMonth: '',
                nextMonth: '',
                months: months,
                weekdays: weekdays,
                weekdaysShort: weekdaysShort
            }
        });

        // Fetch all controls and attach listeners
        let controls = [
            { selector: '[data-today]', fn: () => picker.gotoToday() },
            { selector: '[data-prev]',  fn: () => picker.prevMonth() },
            { selector: '[data-next]',  fn: () => picker.nextMonth() }
        ];

        controls.forEach((control) => {
            document.querySelector(control.selector).addEventListener(
                'click', control.fn
            );
        });
    }

    /**
     * Callback function for when the picker draws a new month.
     *
     * @see https://github.com/dbushell/Pikaday#configuration
     */
    onDraw()
    {
        let monthLabel = document.querySelector('[data-month]');
        let yearLabel = document.querySelector('[data-year]');
        let calendar = this.calendars[0];

        monthLabel.textContent = this.config().i18n.months[calendar.month];
        yearLabel.textContent = calendar.year;
    }
}

module.exports = Calendar;
