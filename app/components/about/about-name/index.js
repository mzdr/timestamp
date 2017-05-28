/* global document, Electron, customElements, BaseElement */

class AboutName extends BaseElement {
    constructor() {
        super().fetchTemplate();

        this.textContent = Electron.remote.app.getName();
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
AboutName.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('about-name', AboutName);
