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
            e.returnValue = this.get(key, value)
        );

        // Save new preference values from renderer
        Electron.ipcMain.on('preferences.set',
            (e, key, value) => this.set(key, value)
        );

        // Received request to save preferences to disk from renderer
        Electron.ipcMain.on('preferences.save', () => this.saveToDisk());

        // Return translation strings
        Electron.ipcMain.on('translate', (e, key) =>
            e.returnValue = this.app.translator.getString(key)
        );
    }

    /**
     * Shows the preferences window.
     */
    show()
    {
        // Don't create multiple windows, focus on last created one instead
        if (this._window && this._window.isDestroyed() === false) {
            this._window.show();

            return;
        }

        // Create window instance
        this._window = new Electron.BrowserWindow({
            resizable: false,
            center: true,
            minimizable: false,
            maximizable: false,
            title: this.app.translator.getString('preferences'),
            alwaysOnTop: true,
            show: false
        });

        // Load the contents
        this._window.loadURL(`file://${__dirname}/preferences.html`);

        // While loading the page, the ready-to-show event will be emitted when
        // renderer process has done drawing for the first time, showing window
        // after this event will have no visual flash
        this._window.once('ready-to-show', () => this._window.show());
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

        // Open links externally by default
        document.documentElement.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="http"]')) {
                e.preventDefault();
                Electron.shell.openExternal(e.target.href);
            }
        });

        // Get all labels which should be translated
        const labels = document.querySelectorAll('[data-locale-key]');

        // Translate all of them
        for (let label of labels) {
            let data = label.getAttribute('data-locale-key');
            let [key, target = 'textContent'] = data.split(':');
            let translation = Electron.ipcRenderer.sendSync('translate', key);

            label[target] = translation;
        }

        // Set window size
        Electron.remote.getCurrentWindow().setContentSize(
            document.body.offsetWidth,
            document.body.offsetHeight,
            false
        );
    }
}

module.exports = Preferences;
