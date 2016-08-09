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

        // Provides access to this component in renderer process
        this._window.component = this;

        // Load the contents aka the view
        this._window.loadURL(`file://${this.app.getViewsDirectory()}/calendar.html`);

        // Register onBlur callback
        this._window.on('blur', (e) => this.onBlur(e));

        // Register window controller
        this._window.webContents.executeJavaScript(
            `new (require('${this.app.getControllersDirectory()}/Calendar'));`
        );
    }

    /**
     * Shows the calendar window.
     */
    show()
    {
        // Do not miss any dark mode changes
        if (typeof this._darkModeHandler === 'function') {
            this._darkModeHandler(this.app.isDarkMode());
        }

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
     * Register callback which will be called when dark mode was changed.
     *
     * @param {function} callback
     */
    onDarkModeChanged(callback)
    {
        this._darkModeHandler = callback;
    }
}

module.exports = Calendar;
