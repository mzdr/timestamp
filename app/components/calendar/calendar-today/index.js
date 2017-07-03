/* global document, customElements, BaseElement, Moment */

class CalendarToday extends BaseElement {
    constructor() {
        super().fetchTemplate();
    }

    /**
     * Draws the today label.
     *
     * @return {CalendarToday}
     */
    draw() {
        // Always use current date/time for the today label, since it’s
        // independent from the calendar content.
        const now = Moment();

        this.innerHTML =
            `${now.format('dddd')},<br><strong>${now.format('Do')}</strong> ${now.format('MMMM')}`;

        return this;
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
CalendarToday.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('calendar-today', CalendarToday);
