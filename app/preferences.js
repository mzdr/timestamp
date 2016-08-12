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

        // Load the contents
        this._window.loadURL(`file://${__dirname}/preferences.html`);

        // Register onBlur callback
        this._window.on('blur', (e) => this.onBlur(e));

        // Get storage file for persisting preferences
        this.storageFile = this.app.getUserPreferencesPath();

        // Load preferences from disk
        this.loadFromDisk();

        // Return preference values to renderer
        Electron.ipcMain.on('preferences.get', (e, key, value) =>
            e.returnValue = this.get(key, value)
        );

        // Save new preference values from renderer
        Electron.ipcMain.on('preferences.set',
            (e, key, value) => this.set(key, value)
        );

        // Received request to save preferences to disk from renderer
        Electron.ipcMain.on('preferences.save', () => this.saveToDisk());
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
    }

    /**
     * Save preferences to to disk.
     */
    saveToDisk()
    {
        const data = this.get();

        // Try writing data to disk
        Fs.writeFileSync(this.storageFile, JSON.stringify(data));

        // Pass new preferences to app
        this.app.onPreferencesChanged(data);
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
     * When dark mode was change notify the renderer process.
     *
     * @param {bool} darkMode If dark mode is enabled or disabled.
     */
    onDarkModeChanged(darkMode)
    {
        this._window.webContents.send('preferences.darkmode', darkMode);
    }

    /**
     * Provide static render function to execute logic in renderer process.
     */
    static render()
    {
        // Define logic for all fields
        const fields = [
            {
                selector: '[data-format]',
                event: 'keyup',
                onLoad: (el) => el.value = Electron.ipcRenderer.sendSync(
                    'preferences.get', 'clockFormat'
                ),
                onChange: (el) => Electron.ipcRenderer.send(
                    'preferences.set', 'clockFormat', el.value
                )
            },
            {
                selector: '[data-startatlogin]',
                event: 'change',
                onLoad: (el) => el.checked = Electron.ipcRenderer.sendSync(
                    'preferences.get', 'startAtLogin'
                ),
                onChange: (el) => Electron.ipcRenderer.send(
                    'preferences.set', 'startAtLogin', el.checked
                )
            }
        ];

        // Apply logic to all fields
        fields.forEach((field) => {
            let el = document.querySelector(field.selector);

            // Add onChange listener
            el.addEventListener(field.event, () => {

                // Update custom field
                field.onChange(el)

                // Persist new data
                Electron.ipcRenderer.send('preferences.save');
            });

            // Fire onLoad listener
            field.onLoad(el);
        });

        // Get all links in preferences window
        const links = document.querySelectorAll('a[href^="http"]');

        // Open links externally by default
        for (let i = 0; i < links.length; i++) {
            links[i].addEventListener('click', (e) => {
                e.preventDefault();
                Electron.shell.openExternal(e.currentTarget.href);
            });
        }

        // Watch for dark mode changes
        Electron.ipcRenderer.on('preferences.darkmode',
            (e, darkMode) => this.toggleDarkMode(darkMode)
        );
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

module.exports = Preferences;
