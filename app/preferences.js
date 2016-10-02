const Fs = require('fs');
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

        // Get storage file for persisting preferences
        this.storageFile = this.app.getUserPreferencesPath();

        // Load preferences from disk
        this.loadFromDisk();

        // Return preference values to renderer
        Electron.ipcMain.on('preferences.get', (e, key, value) =>
            e.sender.send('preferences.get', key, this.get(key, value))
        );

        // Save new preference values from renderer
        Electron.ipcMain.on('preferences.set', (e, key, value) => {
            this.set(key, value)
                .saveToDisk();
        });

        // Received request to show preferences window
        Electron.ipcMain.on('preferences.show', () => this.show());
    }

    /**
     * Shows the preferences window.
     *
     * @return {Preferences}
     */
    show()
    {
        // Don't create multiple windows, focus on last created one instead
        if (this._window && this._window.isDestroyed() === false) {
            this._window.show();

            return this;
        }

        // Create window instance
        this._window = new Electron.BrowserWindow({
            resizable: false,
            center: true,
            minimizable: false,
            maximizable: false,
            alwaysOnTop: true,
            show: false
        });

        // Wait for the renderer to tell us that the window is ready to show
        Electron.ipcMain.on('preferences.ready', () => this._window.show());

        // Load the contents
        this._window.loadURL(`file://${__dirname}/preferences.html`);

        return this;
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
     * @return {Preferences}
     */
    set(key, data)
    {
        if (typeof key === 'object') {
            this._data = key;
        } else {
            this._data[key] = data;
        }

        return this;
    }

    /**
     * Load preferences from disk.
     *
     * @return {Preferences}
     */
    loadFromDisk()
    {
        try {
            var data = Fs.readFileSync(this.storageFile, 'utf8')
        } catch (e) {

            // It's probably the first time the app has been started,
            // just save default preferences and that's it for today
            return this.saveToDisk();

        }

        // Merge loaded preferences from disk with current ones
        const newPreferences = Object.assign({}, this.get(), JSON.parse(data));

        // Store it internally
        this.set(newPreferences);

        // Pass them to the app
        this.app.onPreferencesChanged(newPreferences);

        return this;
    }

    /**
     * Save preferences to to disk.
     *
     * @return {Preferences}
     */
    saveToDisk()
    {
        const data = this.get();

        // Try writing data to disk
        Fs.writeFileSync(this.storageFile, JSON.stringify(data));

        // Pass new preferences to app
        this.app.onPreferencesChanged(data);

        return this;
    }
}

module.exports = Preferences;
