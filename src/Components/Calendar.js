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
            width: 332,
            height: 364,
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
     * @param {boolean} centerToX Center window to new x position or not.
     */
    setPosition(x, y, centerToX = true)
    {
        if (centerToX) {
            x = Math.round(x - this._window.getSize()[0] / 2);
        }

        this._window.setPosition(x, y);
    }
}

module.exports = Calendar;
