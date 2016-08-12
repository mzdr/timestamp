const Moment = require('moment');
const Electron = require('electron');

class Calendar
{
    /**
    * Creates a Calendar instance.
    *
    * @return {Calendar}
    */
    constructor(app)
    {
        // Remember app instance
        this.app = app;

        // Set locale for Moment.js
        Moment.locale(this.app.getLocale());

        // Create window instance
        this._window = new Electron.BrowserWindow({
            width: 332,
            height: 364,
            frame: false,
            resizable: false,
            alwaysOnTop: true,
            show: false
        });

        // Load the contents aka the view
        this._window.loadURL(`file://${__dirname}/calendar.html`);

        // Register onBlur callback
        this._window.on('blur', (e) => this.onBlur(e));

        // Return calendar translations to renderer process
        Electron.ipcMain.on('calendar.translations', (e) =>
            e.returnValue = this.getTranslations()
        );
    }

    /**
     * Shows the calendar window.
     */
    show()
    {
        this._window.show();
    }

    /**
     * Hides the calendar window.
     */
    hide()
    {
        this._window.hide();
    }

    /**
     * Returns a boolean, whether the window is visible to the user.
     *
     * @return {boolean}
     */
    isVisible()
    {
        return this._window.isVisible();
    }

    /**
     * Sets the position of the calendar window.
     *
     * @param {number} x Position on x-axis.
     * @param {number} y Position on y-axis.
     * @param {boolean} centerToX Center window to new x position or not.
     */
    setPosition(x, y, centerToX = true)
    {
        if (centerToX) {
            x = Math.round(x - this._window.getSize()[0] / 2);
        }

        this._window.setPosition(x, y);
    }

    /**
     * Returns the translations for the calendar.
     *
     * @see http://momentjs.com/docs/#/i18n/listing-months-weekdays/
     * @return {object}
     */
    getTranslations()
    {
        return {
            previousMonth: '',  // don't need that, will never be shown
            nextMonth: '',      // ↳ same here
            months: Moment.months(),
            weekdays: Moment.weekdays(),
            weekdaysShort: Moment.weekdaysShort()
        };
    }

    /**
     * Called when the window loses focus. In our case once the user clicks
     * beside the calendar window, it will be hidden.
     */
    onBlur()
    {
        this.hide();
    }

    /**
     * When dark mode was change notify the renderer process.
     *
     * @param {bool} darkMode If dark mode is enabled or disabled.
     */
    onDarkModeChanged(darkMode)
    {
        this._window.webContents.send('calendar.darkmode', darkMode);
    }

    /**
     * Provide static render function to execute logic in renderer process.
     */
    static render()
    {
        // Get translations for the Pikaday calendar from Moment.js locale
        let translations = Electron.ipcRenderer.sendSync(
            'calendar.translations'
        );

        // Watch for dark mode changes
        Electron.ipcRenderer.on(
            'calendar.darkmode', (e, darkMode) => this.toggleDarkMode(darkMode)
        );

        // Create pikaday calendar
        this.createPikaday({
            translations: translations,
            onDraw: this.onDraw
        });
    }

    /**
     * Creates the Pikaday datepicker instance. We use it as a simple calendar.
     *
     * @see https://dbushell.github.io/Pikaday/
     * @param {object} options Calendar options.
     */
    static createPikaday(options)
    {
        // Have to require Pikaday over here because in main process it crashes
        const pikaday = new (require('pikaday'))({
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
    static onDraw()
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
     * @param {boolean} darkMode Enable/disable dark mode styles.
     */
    static toggleDarkMode(darkMode)
    {
        document.documentElement.classList[
            darkMode ? 'add' : 'remove'
        ]('dark-mode');
    }
}

module.exports = Calendar;
