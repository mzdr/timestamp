/* global document, customElements, BaseElement */

class CalendarMonth extends BaseElement {
    constructor() {
        super().fetchTemplate();
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
CalendarMonth.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('calendar-month', CalendarMonth);
