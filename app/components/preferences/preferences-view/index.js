/* global document, customElements, BaseElement, PreferencesEvent, TabEvent, Electron, requestAnimationFrame */

class PreferencesView extends BaseElement {
    constructor() {
        super().fetchTemplate();

        // Register event listener for changes of all preferences items
        PreferencesEvent.on('change', e => this.onChange(e));

        // Register event listener for tab switches
        TabEvent.on('switch', e => this.onSwitch(e));

        // Register event listener for clicks within the preferences view
        this.shadowRoot.addEventListener('click', e => this.onClick(e));
    }

    /**
     * Updates the preferences window by gathering the current content size and
     * showing the window if it’s not visible.
     *
     * @return {PreferencesView}
     */
    update() {
        const currentWindow = Electron.remote.getCurrentWindow();

        requestAnimationFrame(() => {
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

        return this;
    }

    /**
     * A preferences item has been changed. We are going to send the new
     * preferences item value to the main process where it's going to be
     * further processed.
     *
     * @param {string} key Preferences item key.
     * @param {string} value Preferences item value.
     * @return {PreferencesView}
     */
    onChange({ detail: { key, value } }) {
        Electron.ipcRenderer.send('preferences.set', key, value);

        return this;
    }

    /**
     * When a tab switched occured, make sure the preferences window is up to
     * date regarding it’s size. Also specific clicked tabs cause specific
     * actions.
     *
     * @param {TabEvent} e Original emitted tab event.
     * @return {PreferencesView}
     */
    onSwitch({ detail: { tab } }) {
        if (tab === 'quit') {
            Electron.remote.app.quit();

            return this;
        }

        return this.update();
    }

    /**
     * A click occured within the preferences view.
     *
     * @param {Event} e Original emitted event.
     * @return {PreferencesView}
     */
    onClick(e) {
        const target = e.target;

        // Make sure links will open externally
        if (target && target.closest('a[href^="http"]')) {
            Electron.shell.openExternal(target.href);

            e.preventDefault();
        }

        return this;
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
PreferencesView.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('preferences-view', PreferencesView);
