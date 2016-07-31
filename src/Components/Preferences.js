const Fs = require('fs');
const Path = require('path');
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

        // Get storage file for persisting preferences
        this.storageFile = Path.join(
            Electron.app.getPath('userData'),
            'user-preferences.json'
        );

        // Default preferences
        this.data = {
            clockFormat: 'HH:MM:ss',
            autoStart: false
        };

        // Load preferences from disk
        this.load();
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

    /**
     * Gets a specific part of the current preferences. If no key is provided,
     * all preferences will be returned.
     *
     * @param {string} key Key of preference to return.
     * @return {mixed}
     */
    get(key)
    {
        if (typeof key === 'string') {
            return this.data[key];
        }

        return this.data;
    }

    /**
     * Sets a specific part of the preferences. If the key is an object,
     * it will be treated as a set of preferences and will replace the
     * current ones.
     *
     * @param {string|object} key Key of preferences or all preferences.
     * @param {mixed} data Preference data.
     */
    set(key, data)
    {
        if (typeof key === 'object') {
            this.data = key;
        } else {
            this.data[key] = data;
        }
    }

    /**
     * Load preferences from disk.
     */
    load() {

        try {
            const data = JSON.parse(Fs.readFileSync(this.storageFile, 'utf8'));

            // Successfully loaded settings from disk
            this.data = data;

        } catch (e) {}
    }

    /**
     * Save preferences to to disk.
     */
    save()
    {
        try {
            Fs.writeFileSync(this.storageFile, JSON.stringify(this.data));
        } catch (e) {}
    }
}

module.exports = Preferences;
