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
            'Calendar'
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
     * Collect all necessary weekday and month translations using the
     * Date.prototype.toLocaleString() functionality.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation
     * @param {string} locale A string with a BCP 47 language tag.
     * @return {object}
     */
    getTranslationsFromLocale(locale)
    {
        const date = new Date(2015, 0);
        const months = [];
        const weekdays = [];
        const weekdaysShort = [];

        // Collect translations for months
        for (let i = 0; i < 12; i++) {
            date.setMonth(i);
            months.push(date.toLocaleString(locale, { month: 'long' }));
        }

        // March the 1st in 2015 is a sunday
        date.setMonth(2, 1);

        // Collect translations for weekdays
        for (let i = 1; i < 8; i++) {
            date.setMonth(date.getMonth(), i);
            weekdays.push(date.toLocaleString(locale, { weekday: 'long' }));
            weekdaysShort.push(date.toLocaleString(locale, { weekday: 'short' }));
        }

        return {
            previousMonth: '',
            nextMonth: '',
            months: months,
            weekdays: weekdays,
            weekdaysShort: weekdaysShort
        };
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
        if (preferences.clockFormat !== this.clock.format) {
            this.clock.format = preferences.clockFormat;
        }

        // Auto start was changed
        if (preferences.autoStart !== this.autoStart.isEnabled()) {
            this.autoStart[preferences.autoStart ? 'enable' : 'disable']()
        }
    }
}

new App;
