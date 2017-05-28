/* global document, customElements, BaseElement */

class PreferencesItemDescription extends BaseElement {
    constructor() {
        super().fetchTemplate();
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
PreferencesItemDescription.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('preferences-item-description', PreferencesItemDescription);
