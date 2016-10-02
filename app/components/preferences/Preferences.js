class Preferences
{
    constructor()
    {
        const template = this.constructor.document.querySelector('#view');
        const clone = document.importNode(template.content, true);

        // Append preferences markup
        document.body.appendChild(clone);

        // Register event listener for changes of all preferences items
        PreferencesEvent.on('change', (e) => this.onChange(e));

        // Since the preferences markup has been created, which means that all
        // tabs including their event listeners have also been created, we now
        // can add a final listener to the tab.switch event which will be run
        // after all tabs have been updated
        TabEvent.on('switch', ({ detail: { tab }}) => {
            const currentWindow = Electron.remote.getCurrentWindow();

            // If the quit tab was clicked, just quit the app
            if (tab === 'quit') {
                return Electron.remote.app.quit();
            }

            // Update the window size
            currentWindow.setContentSize(
                document.body.offsetWidth,
                document.body.offsetHeight
            );

            // If the window is hidden, it's probably the first time we are
            // going to show it. Tell main process we are ready.
            if (currentWindow.isVisible() === false) {
                Electron.ipcRenderer.send('preferences.ready');
            }
        });

        // Open links externally by default
        document.documentElement.addEventListener('click', (e) => {
            let target = e.target;

            do {
                if (target.matches('a[href^="http"]')) {
                    Electron.shell.openExternal(target.href);
                    return e.preventDefault();
                }
            } while ((target = target.parentElement) !== null);
        });
    }

    /**
     * A preferences item has been changed. We are going to send the new
     * preferences item value to the main process where it's going to be
     * further processed.
     *
     * @param {string} key Preferences item key.
     * @param {string} value Preferences item value.
     * @return {Preferences}
     */
    onChange({ detail: { key, value }})
    {
        Electron.ipcRenderer.send('preferences.set', key, value);

        return this;
    }
}

Preferences.document = document.currentScript.ownerDocument;
