/* global document, Electron, customElements, BaseElement */

class AboutVersion extends BaseElement {
    constructor() {
        super().fetchTemplate();

        this.textContent = Electron.remote.app.getVersion();
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
AboutVersion.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('about-version', AboutVersion);
