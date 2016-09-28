class Preferences
{
    constructor()
    {
        const template = this.constructor.document.querySelector('#view');
        const clone = document.importNode(template.content, true);

        // Append preferences markup
        document.body.appendChild(clone);

        // Register all UI related event listeners
        PreferencesEvent.on('change', (e) => this.onChange(e));

        // Since the preferences markup has been created, which means that all
        // tabs including their event listeners have also been created, we now
        // can add a final listener to the tab.switch event which will be run
        // after all tabs have been updated
        TabEvent.on('switch', (e) => {
            const requestedTab = e.target.getAttribute('tab');

            // If the quit tab was clicked, just quit the app
            if (requestedTab === 'quit') {
                return Electron.remote.app.quit();
            }

            // Update the window size
            Electron.remote.getCurrentWindow().setContentSize(
                document.body.offsetWidth,
                document.body.offsetHeight
            );
        });

        // Received request to deliver current content size
        Electron.ipcRenderer.once('preferences.content.size',
            () => Electron.ipcRenderer.send(
                'preferences.content.size',
                document.body.offsetWidth,
                document.body.offsetHeight
            )
        );

        // Open links externally by default
        document.documentElement.addEventListener('click', (e) => {
            let target = e.target;

            do {
                if (target.matches('a[href^="http"]') === false) {
                    continue;
                }

                Electron.shell.openExternal(target.href);
                return e.preventDefault();
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
