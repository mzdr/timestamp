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
            width: 256,
            height: 224,
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
     * Sets the position of the calendar window.
     *
     * @param {number} x Position on x-axis.
     * @param {number} y Position on y-axis.
     */
    setPosition(x, y)
    {
        this._window.setPosition(x, y);
    }
}

module.exports = Calendar;
