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
        // Remember app instance
        this.app = app;

        // Default preferences
        this.set(this.app.getDefaultPreferences());

        // Create window instance
        this._window = new Electron.BrowserWindow({
            width: 300,
            height: 187,
            frame: false,
            resizable: false,
            alwaysOnTop: true,
            show: false
        });

        // Provides access to this component in renderer process
        this._window.component = this;

        // Load the contents
        this._window.loadURL(`file://${app.getViewsDirectory()}/preferences.html`);

        // Register onBlur callback
        this._window.on('blur', (e) => this.onBlur(e));

        // Get storage file for persisting preferences
        this.storageFile = Path.join(
            Electron.app.getPath('userData'),
            'user-preferences.json'
        );

        // Load preferences from disk
        this.load();

        // Register window controller
        this._window.webContents.executeJavaScript(
            `new (require('${this.app.getControllersDirectory()}/Preferences'));`
        );
    }

    /**
     * Shows the preferences window.
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
            return this._data[key];
        }

        return this._data;
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
            this._data = key;
        } else {
            this._data[key] = data;
        }
    }

    /**
     * Load preferences from disk.
     */
    load() {

        try {
            const data = JSON.parse(Fs.readFileSync(this.storageFile, 'utf8'));

            // Merge loaded preferences from disk with current ones
            const newPreferences = Object.assign({}, this.get(), data);

            // Store it internally
            this.set(newPreferences);

            // Pass them to the app
            this.app.onPreferencesChanged(newPreferences);

        } catch (e) {}
    }

    /**
     * Save preferences to to disk.
     */
    save()
    {
        try {
            const data = this.get();

            // Try writing data to disk
            Fs.writeFileSync(this.storageFile, JSON.stringify(data));

            // Pass new preferences to app
            this.app.onPreferencesChanged(data);

        } catch (e) {}
    }

    /**
     * Called when the window loses focus. In our case once the user clicks
     * beside the preferences window, it will be hidden.
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

module.exports = Preferences;
