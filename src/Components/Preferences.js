const Electron = require('electron');

class Preferences
{
    /**
    * Creates a Preferences instance.
    *
    * @return {Preferences}
    */
    constructor(app)
    {
        // Create window instance
        this._window = new Electron.BrowserWindow({
            width: 800,
            height: 600,
            frame: false,
            resizable: false,
            alwaysOnTop: true,
            show: false
        });

        // Load the contents
        this._window.loadURL(`${app.viewsDir}/preferences.html`);

        // Once the user clicks beside the preferences window, it will be hidden
        this._window.on('blur', (e) => this.hide());
    }

    /**
     * Shows the preferences window.
     */
    show()
    {
        this._window.show();
    }

    /**
     * Hides the preferences window.
     */
    hide()
    {
        this._window.hide();
    }

    /**
     * Sets the position of the calendar window.
     *
     * @param {number} x Position on x-axis.
     * @param {number} y Position on y-axis.
     */
    setPosition(x, y)
    {
        this._window.setPosition(x, y);
    }

    /**
     * Returns the currently set callback function which will be
     * called once the preferences have been changed.
     *
     * @return {function}
     */
    get onChange()
    {
        return this._changeHandler;
    }

    /**
     * Sets the callback function which will be called once the preferences
     * have been changed.
     *
     * @param {function} fn Callback function.
     */
    set onChange(fn)
    {
        this._changeHandler = fn;
    }
}

module.exports = Preferences;
