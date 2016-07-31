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
        // Set up all available preferences and their current/default values
        this.data = Electron.ipcRenderer.sendSync('preferences.get')

        // Add class if in dark mode
        if (Electron.ipcRenderer.sendSync('app.darkmode')) {
            document.documentElement.classList.add('dark-mode');
        }

        // Format input field
        const formatInput = document.querySelector('[data-format]');

        // Format input has been changed
        formatInput.addEventListener(
            'keyup',
            (e) => this.onFormatChanged(e.currentTarget.value)
        );

        // Get all links in preferences window
        const links = document.querySelectorAll('a[href^="http"]');

        // Open links externally by default
        for (let i = 0; i < links.length; i++) {
            links[i].addEventListener('click', (e) => {
                e.preventDefault();
                Electron.shell.openExternal(e.currentTarget.href);
            });
        }
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
        Electron.ipcRenderer.send('preferences.set', this.data);
    }
}

module.exports = Preferences;
