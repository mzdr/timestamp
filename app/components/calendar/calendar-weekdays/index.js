/* global document, Moment, customElements, BaseElement */

class CalendarWeekdays extends BaseElement {
    constructor() {
        super().fetchTemplate();
    }

    /**
     * Draws the actual weekdays legend.
     *
     * @return {CalendarWeekdays}
     */
    draw() {
        // Always use today for determing the current weekday, since it’s good
        // to know which weekday is today even if you are viewing another month.
        const currentWeekday = Moment().weekday();

        // @see https://momentjs.com/docs/#/i18n/listing-months-weekdays/
        const weekdaysShort = Moment.weekdaysShort(true);

        [...this.shadowRoot.querySelectorAll('calendar-weekday')].forEach(
            (weekday, index) => {
                Object.assign(weekday, { textContent: weekdaysShort[index] });

                if (index === currentWeekday) {
                    weekday.setAttribute('current', '');
                } else {
                    weekday.removeAttribute('current');
                }
            }
        );

        return this;
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
CalendarWeekdays.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('calendar-weekdays', CalendarWeekdays);
