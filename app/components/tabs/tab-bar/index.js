/* global document, Electron, customElements, BaseElement, TabEvent */

class TabBar extends BaseElement {
    constructor() {
        super().fetchTemplate();

        // Depending on the update response we are going the show a different
        // tab initially. If we have an update the about tab will be active,
        // otherwise it’s the general tab
        Electron.ipcRenderer.once('app.update', (e, update) => {
            const tab = update.code < 0 ? 'about' : 'general';

            this.dispatchEvent(new TabEvent('switch', { detail: { tab } }));
        });

        // Check if there is an update available
        Electron.ipcRenderer.send('app.update');
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
TabBar.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('tab-bar', TabBar);
