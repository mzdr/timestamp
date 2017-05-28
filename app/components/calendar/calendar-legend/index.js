/* global document, customElements, BaseElement */

class CalendarLegend extends BaseElement {
    constructor() {
        super().fetchTemplate();
    }

    /**
     * Draws the currently selected month.
     *
     * @param {number} selectedMonth Currently selected month.
     * @param {number} selectedYear Currently selected year.
     * @return {CalendarLegend}
     */
    draw(selectedMonth, selectedYear) {
        this.textContent = `${selectedMonth} / ${selectedYear}`;

        return this;
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
CalendarLegend.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('calendar-legend', CalendarLegend);
