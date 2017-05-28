/* global document, customElements, BaseElement, CalendarEvent */

class CalendarGoToToday extends BaseElement {
    constructor() {
        super().fetchTemplate();

        this.addEventListener('click', () => this.onclick());
    }

    /**
     * The go to today element has been clicked.
     *
     * @return {CalendarGoToToday}
     */
    onclick() {
        this.dispatchEvent(new CalendarEvent('goto.today'));

        return this;
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
CalendarGoToToday.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('calendar-goto-today', CalendarGoToToday);
