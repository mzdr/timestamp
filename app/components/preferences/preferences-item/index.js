/* global document, customElements, BaseElement */

class PreferencesItem extends BaseElement {
    constructor() {
        super().fetchTemplate();
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
PreferencesItem.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('preferences-item', PreferencesItem);
