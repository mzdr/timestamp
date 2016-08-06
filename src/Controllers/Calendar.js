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
        // Update styles when dark mode was changed
        Electron.ipcRenderer.on(
            'app.darkmode',

            // Add/remove dark-mode class to/from root DOM element
            (e, darkMode) => {
                document.documentElement.classList[
                    darkMode ? 'add' : 'remove'
                ]('dark-mode');
            }
        );

        // Get detected locale from app
        let locale = Electron.ipcRenderer.sendSync('app.locale');

        // Collect all necessary translations from current locale
        this.translations = this.getTranslationsFromLocale(locale);

        // Create pikaday calender
        this.createPikaday();
    }

    /**
     * Creates the Pikaday datepicker instance. We use it as a simple calender.
     *
     * @see https://dbushell.github.io/Pikaday/
     */
    createPikaday()
    {
        this.pikaday = new Pikaday({
            field: document.createElement('div'),
            bound: false,
            container: document.querySelector('[data-pikaday]'),
            showWeekNumber: false,
            showDaysInNextAndPreviousMonths: true,
            onDraw: this.onDraw,
            i18n: this.translations
        });

        // Fetch all controls
        const controls = [
            { selector: '[data-today]', fn: () => this.pikaday.gotoToday() },
            { selector: '[data-prev]',  fn: () => this.pikaday.prevMonth() },
            { selector: '[data-next]',  fn: () => this.pikaday.nextMonth() }
        ];

        // Assign click listeners
        controls.forEach((control) => {
            document.querySelector(control.selector).addEventListener(
                'click', control.fn
            );
        });

        // Redraw every minute to avoid displaying old/wrong states
        setInterval(() => this.pikaday.draw(), 1000 * 60);
    }

    /**
     * Collect all necessary weekday and month translations using the
     * Date.prototype.toLocaleString() functionality.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation
     * @param {string} locale A string with a BCP 47 language tag.
     * @return {object}
     */
    getTranslationsFromLocale(locale)
    {
        const date = new Date(2015, 0);
        const months = [];
        const weekdays = [];
        const weekdaysShort = [];

        // Collect translations for months
        for (let i = 0; i < 12; i++) {
            date.setMonth(i);
            months.push(date.toLocaleString(locale, { month: 'long' }));
        }

        // March the 1st in 2015 is a sunday
        date.setMonth(2, 1);

        // Collect translations for weekdays
        for (let i = 1; i < 8; i++) {
            date.setMonth(date.getMonth(), i);
            weekdays.push(date.toLocaleString(locale, { weekday: 'long' }));
            weekdaysShort.push(date.toLocaleString(locale, { weekday: 'short' }));
        }

        return {
            previousMonth: '',
            nextMonth: '',
            months: months,
            weekdays: weekdays,
            weekdaysShort: weekdaysShort
        };
    }

    /**
     * Callback function for when the picker draws a new month.
     *
     * @see https://github.com/dbushell/Pikaday#configuration
     */
    onDraw()
    {
        const monthLabel = document.querySelector('[data-month]');
        const yearLabel = document.querySelector('[data-year]');
        const calendar = this.calendars[0];

        monthLabel.textContent = this.config().i18n.months[calendar.month];
        yearLabel.textContent = calendar.year;
    }
}

module.exports = Calendar;
