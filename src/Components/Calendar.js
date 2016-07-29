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
        // Create window instance
        this._window = new Electron.BrowserWindow({
            width: 340,
            height: 404,
            frame: false,
            resizable: false,
            alwaysOnTop: true,
            show: false
        });

        // Load the contents
        this._window.loadURL(`${app.viewsDir}/calendar.html`);

        // Once the user clicks beside the calendar window, it will be hidden
        this._window.on('blur', (e) => this.hide());
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
     */
    setPosition(x, y)
    {
        // Center calendar window to x position
        x = x - (this._window.getSize()[0] / 2);

        this._window.setPosition(x || 0, y || 0);
    }
}

module.exports = Calendar;
