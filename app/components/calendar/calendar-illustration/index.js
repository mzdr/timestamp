/* global document, customElements, BaseElement, Moment */

class CalendarIllustration extends BaseElement {
    constructor() {
        super().fetchTemplate();
    }

    /**
     * Draws the illustration.
     *
     * @return {CalendarIllustration}
     */
    draw() {
        const moment = Moment();

        this.dataset.time = moment.format('ha');
        this.dataset.quarter = moment.format('Q');

        return this;
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
CalendarIllustration.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('calendar-illustration', CalendarIllustration);
