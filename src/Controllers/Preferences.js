const Electron = require('electron');

class Preferences
{
    /**
     * Creates an instance of the Preferences controller.
     *
     * @return {Preferences}
     */
    constructor()
    {
        // Get access to app from main process
        this.app = Electron.remote.getGlobal('App');

        // Set up all available preferences and their current/default values
        this.data = {
            clockFormat: this.app.preferences.clockFormat
        };

        // Format input field
        const formatInput = document.getElementById('format');

        // Add class if in dark mode
        if (Electron.remote.systemPreferences.isDarkMode()) {
            document.documentElement.classList.add('dark-mode');
        }

        // Format input has been changed
        formatInput.addEventListener(
            'keyup',
            (e) => this.onFormatChanged(e.currentTarget.value)
        );
    }

    /**
     * Callback handling the change of the format input field.
     *
     * @param {string} newFormat New clock format.
     */
    onFormatChanged(newFormat)
    {
        // Nothing changed at all
        if (this.data.clockFormat === newFormat) {
            return;
        }

        this.data.clockFormat = newFormat;
        this.onChange();
    }

    /**
     * At least one setting has been changed. Pass new settings to app.
     */
    onChange()
    {
        this.app.preferences.onChange(this.data);
    }
}

module.exports = Preferences;
