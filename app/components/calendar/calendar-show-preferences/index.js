/* global document, Electron, customElements, BaseElement */

class CalendarShowPreferences extends BaseElement {
    constructor() {
        super().fetchTemplate();

        this.addEventListener('click', () => this.onclick());
    }

    /**
     * The show preferences button has been clicked.
     *
     * @return {CalendarShowPreferences}
     */
    onclick() {
        Electron.ipcRenderer.send('preferences.show');

        return this;
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
CalendarShowPreferences.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('calendar-show-preferences', CalendarShowPreferences);
