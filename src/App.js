const Electron = require('electron');
const Path = require('path');

class App
{
    /**
     * Starts the Timestamp app.
     *
     * @return {App}
     */
    constructor()
    {
        this.requiredComponents = [
            'Tray',
            'Clock',
            'Preferences',
            'Calendar',
            'Updater'
        ];

        // This method will be called when Electron has finished
        // initialization and is ready to create browser windows.
        // Some APIs can only be used after this event occurs.
        Electron.app.on('ready', () => {
            new (require(`${this.getControllersDirectory()}/Ready`))(this);
        })
    }

    /**
     * Returns the current application locale.
     *
     * @see https://github.com/electron/electron/blob/master/docs/api/app.md#appgetlocale
     * @see https://github.com/electron/electron/blob/master/docs/api/locales.md
     * @return {string}
     */
    getLocale()
    {
        return Electron.app.getLocale() || 'en';
    }

    /**
     * Returns the default preferences for this app.
     *
     * @return {object}
     */
    getDefaultPreferences()
    {
        return {
            clockFormat: 'HH:mm:ss',
            autoStart: false
        };
    }

    /**
     * Returns the path to the file where all the user preferences are stored.
     *
     * @return {string}
     */
    getUserPreferencesPath()
    {
        return Path.join(
            Electron.app.getPath('userData'),
            'UserPreferences.json'
        );
    }

    /**
     * Returns the path to the views directory.
     *
     * @return {string}
     */
    getViewsDirectory()
    {
        return Path.normalize(`${__dirname}/Views`);
    }

    /**
     * Returns the path to the controllers directory.
     *
     * @return {string}
     */
    getControllersDirectory()
    {
        return Path.normalize(`${__dirname}/Controllers`);
    }

    /**
     * Returns the path to the components directory.
     *
     * @return {string}
     */
    getComponentsDirectory()
    {
        return Path.normalize(`${__dirname}/Components`);
    }

    /**
     * This method returns true if the system is in Dark Mode,
     * and false otherwise.
     *
     * @see http://electron.atom.io/docs/api/system-preferences/#systempreferencesisdarkmode-macos
     * @return {boolean}
     */
    isDarkMode()
    {
        return Electron.systemPreferences.isDarkMode();
    }

    /**
     * Calls a given callback when dark mode in macOS is being enabled/disabled.
     *
     * @see http://electron.atom.io/docs/api/system-preferences/#systempreferencessubscribenotificationevent-callback-macos
     * @param {Function} callback
     */
    onDarkModeChanged(callback)
    {
        Electron.systemPreferences.subscribeNotification(
            'AppleInterfaceThemeChangedNotification',
            () => callback(this.isDarkMode())
        );
    }

    /**
     * Handle change of preferences.
     *
     * @param {object} preferences New preferences.
     */
    onPreferencesChanged(preferences)
    {
        // We have a new clock format
        if (preferences.clockFormat !== this.clock.getFormat()) {
            this.clock.setFormat(preferences.clockFormat);
        }

        // Auto start was changed
        if (preferences.autoStart !== this.autoStart.isEnabled()) {
            this.autoStart[preferences.autoStart ? 'enable' : 'disable']()
        }
    }
}

new App;
