/* global document, customElements, BaseElement, CalendarEvent */

class CalendarGoToMonth extends BaseElement {
    constructor() {
        super().fetchTemplate();

        this.addEventListener('click', () => this.onclick());
    }

    /**
     * One of the listed months has been clicked. Going to dispatch a
     * CalendarEvent to notify the other components.
     *
     * @return {CalendarGoToMonth}
     */
    onclick() {
        const month = this.getAttribute('number');

        this.dispatchEvent(
            new CalendarEvent('goto.month', {
                detail: {
                    month
                }
            })
        );

        return this;
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
CalendarGoToMonth.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('calendar-goto-month', CalendarGoToMonth);
