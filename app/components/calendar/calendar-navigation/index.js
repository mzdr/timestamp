/* global document, Moment, customElements, BaseElement */

class CalendarNavigation extends BaseElement {
    constructor() {
        super().fetchTemplate();
    }

    /**
     * Draws the actual calendar navigation where you can jump between months
     * or years.
     *
     * @param {Moment} now The current date that is being displayed.
     * @return {CalendarNavigation}
     */
    draw(now) {
        const selectedMonth = now.month();

        // @see https://momentjs.com/docs/#/i18n/listing-months-weekdays/
        const months = Moment.months();
        const years = [now.year() - 1, now.year() + 1];

        [...this.shadowRoot.querySelectorAll('calendar-goto-month')].forEach(
            (gotoMonth, index) => {
                gotoMonth.setAttribute('title', months[index]);
                gotoMonth.setAttribute('number', index);

                if (index === selectedMonth) {
                    gotoMonth.setAttribute('current', '');
                } else {
                    gotoMonth.removeAttribute('current');
                }
            }
        );

        [...this.shadowRoot.querySelectorAll('calendar-goto-year')].forEach(
            (gotoYear, index) => gotoYear.setAttribute('number', years[index])
        );

        return this;
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
CalendarNavigation.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('calendar-navigation', CalendarNavigation);
