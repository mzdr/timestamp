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
            width: 300,
            height: 187,
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
     * Sets the position of the preferences window.
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

    get()
    {
        return {
            clockFormat: 'HH:MM:ss'
        }
    }

    set() {}
    load() {}
    save() {}
}

module.exports = Preferences;
