const Pikaday = require('pikaday');
const Electron = require('electron');

class Calendar
{
    /**
     * Creates an instance of the Calendar controller which is responsible for
     * controlling the renderer process of the calendar view.
     *
     * @return {Calendar}
     */
    constructor()
    {
        // Remember associated component of this controller
        this.component = Electron.remote.getCurrentWindow().component;

        // Create pikaday calender
        this.createPikaday({
            translations: this.component.getTranslations(),
            onDraw: this.onDraw
        });

        // Register handler when dark mode is being changed
        this.component.onDarkModeChanged(
            (darkMode) => this.toggleDarkMode(darkMode)
        );
    }

    /**
     * Creates the Pikaday datepicker instance. We use it as a simple calender.
     *
     * @see https://dbushell.github.io/Pikaday/
     * @param {object} options Calendar options.
     */
    createPikaday(options)
    {
        const pikaday = new Pikaday({
            field: document.createElement('div'),
            bound: false,
            container: document.querySelector('[data-pikaday]'),
            showWeekNumber: false,
            showDaysInNextAndPreviousMonths: true,
            onDraw: options.onDraw,
            i18n: options.translations
        });

        // Fetch all controls
        const controls = [
            { selector: '[data-today]', fn: () => pikaday.gotoToday() },
            { selector: '[data-prev]',  fn: () => pikaday.prevMonth() },
            { selector: '[data-next]',  fn: () => pikaday.nextMonth() }
        ];

        // Assign click listeners
        controls.forEach((control) => {
            document.querySelector(control.selector).addEventListener(
                'click', control.fn
            );
        });

        // Redraw every minute to avoid displaying old/wrong states
        setInterval(() => pikaday.draw(), 1000 * 60);
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

    /**
     * When the dark mode is being changed we need to adjust the styles by
     * adding or removing the dark-mode class to the root DOM element.
     *
     * @param {boolean} darkMode
     */
    toggleDarkMode(darkMode)
    {
        document.documentElement.classList[
            darkMode ? 'add' : 'remove'
        ]('dark-mode');
    }
}

module.exports = Calendar;
