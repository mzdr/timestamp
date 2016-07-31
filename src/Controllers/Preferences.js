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

        // Define logic for all fields
        const fields = [
            {
                selector: '[data-format]',
                event: 'keyup',
                onChange: (el) => this.data.clockFormat = el.value,
                onLoad: (el) => el.value = this.data.clockFormat
            },
            {
                selector: '[data-autostart]',
                event: 'change',
                onChange: (el) => this.data.autoStart = el.checked,
                onLoad: (el) => el.checked = this.data.autoStart
            }
        ];

        // Apply logic to all fields
        fields.forEach((field) => {
            let el = document.querySelector(field.selector);

            el.addEventListener(field.event, () => {
                field.onChange(el);
                this.onChange();
            });

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
