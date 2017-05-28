/* global document, customElements, BaseElement, PreferencesEvent, TabEvent, Electron */

class PreferencesView extends BaseElement {
    constructor() {
        super().fetchTemplate();

        // Register event listener for changes of all preferences items
        PreferencesEvent.on('change', e => this.onChange(e));

        // Since the preferences markup has been created, which means that all
        // tabs including their event listeners have also been created, we now
        // can add a final listener to the tab.switch event which will be run
        // after all tabs have been updated
        TabEvent.on('switch', ({ detail: { tab } }) => {
            const currentWindow = Electron.remote.getCurrentWindow();

            // If the quit tab was clicked, just quit the app
            if (tab === 'quit') {
                Electron.remote.app.quit();
                return;
            }

            // Update the window size
            currentWindow.setContentSize(
                document.body.offsetWidth,
                document.body.offsetHeight
            );

            // If the window is hidden, it’s probably the first time we are
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
                    e.preventDefault();
                    return;
                }

                target = target.parentElement;
            } while (target !== null);
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
    onChange({ detail: { key, value } }) {
        Electron.ipcRenderer.send('preferences.set', key, value);

        return this;
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
PreferencesView.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('preferences-view', PreferencesView);
