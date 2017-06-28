/* global document, Electron, customElements, BaseElement */

class CalendarShowPreferences extends BaseElement {
    constructor() {
        super().fetchTemplate();

        this.addEventListener('click', () => this.onClick());

        // Received response from update checks
        Electron.ipcRenderer.on('app.update.check',
            (...args) => this.onUpdateChecked(...args)
        );
    }

    /**
     * The show preferences button has been clicked.
     *
     * @return {CalendarShowPreferences}
     */
    onClick() {
        Electron.ipcRenderer.send('preferences.show');

        return this;
    }

    /**
     * Received response from checking for updates.
     *
     * @param {Event} e Original emitted event.
     * @param {object} update Update response.
     * @return {AboutUpdate}
     */
    onUpdateChecked(e, update) {
        this.classList[update.code < 0 ? 'add' : 'remove']('update-available');

        return this;
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
CalendarShowPreferences.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('calendar-show-preferences', CalendarShowPreferences);
