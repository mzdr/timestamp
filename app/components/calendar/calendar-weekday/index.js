/* global document, customElements, BaseElement */

class CalendarWeekday extends BaseElement {
    constructor() {
        super().fetchTemplate();
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
CalendarWeekday.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('calendar-weekday', CalendarWeekday);
