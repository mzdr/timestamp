/* global document, customElements, BaseElement, CalendarEvent */

class CalendarDay extends BaseElement {
    constructor() {
        super().fetchTemplate();

        this.addEventListener('click', () => this.onClick());
    }

    /**
     * The day element has been clicked.
     *
     * @return {CalendarDay}
     */
    onClick() {
        const detail = {};
        const diff = this.getAttribute('diff');

        if (diff) {
            detail.diff = parseInt(diff, 10) || 0;
        }

        this.dispatchEvent(
            new CalendarEvent('day.clicked', { detail })
        );

        return this;
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
CalendarDay.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('calendar-day', CalendarDay);
