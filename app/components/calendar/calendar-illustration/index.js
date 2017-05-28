/* global document, customElements, BaseElement */

class CalendarIllustration extends BaseElement {
    constructor() {
        super().fetchTemplate();
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
CalendarIllustration.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('calendar-illustration', CalendarIllustration);
