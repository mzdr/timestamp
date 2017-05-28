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
        const moment = Moment();

        this.innerHTML =
            `${moment.format('dddd')},<br><strong>${moment.format('Do')}</strong> ${moment.format('MMMM')}`;

        return this;
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
CalendarToday.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('calendar-today', CalendarToday);
