/* global document, customElements, BaseElement */

class CalendarLegend extends BaseElement {
    constructor() {
        super().fetchTemplate();
    }

    /**
     * Draws the currently selected month.
     *
     * @param {Moment} now The current date that is being displayed.
     * @return {CalendarLegend}
     */
    draw(now) {
        const currentMonth = now.format('MM');
        const currentYear = now.format('YYYY');

        this.textContent = `${currentMonth} / ${currentYear}`;

        return this;
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
CalendarLegend.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('calendar-legend', CalendarLegend);
