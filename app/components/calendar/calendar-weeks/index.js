/* global document, customElements, Moment, BaseElement */

class CalendarWeeks extends BaseElement {
    constructor() {
        super().fetchTemplate();
    }

    /**
     * Draws the actual content of the calendar which is the currently selected
     * month and all of it's weeks and days.
     *
     * @param {Moment} currentDate The current date that is being displayed.
     * @return {CalendarMonth}
     */
    draw(moment) {
        const currentDate = Moment(moment);
        const lastDate = Moment(currentDate).endOf('month').weekday(6);
        const today = Moment().startOf('date');

        // Start by the first weekday of the first week of the month
        currentDate.startOf('month').weekday(0);

        // Run through each week…
        [...this.shadowRoot.querySelectorAll('calendar-week')].forEach(
            (week) => {
                const withinMonth = Moment.min(currentDate, lastDate) === currentDate;
                const currentWeek = currentDate.isSame(today, 'week');

                if (withinMonth) {
                    week.hidden = false; // eslint-disable-line no-param-reassign
                    week.setAttribute('weekofyear', currentDate.format('w'));

                    if (currentWeek) {
                        week.setAttribute('current', '');
                    } else {
                        week.removeAttribute('current');
                    }
                } else {
                    week.removeAttributes();
                    week.hidden = true; // eslint-disable-line no-param-reassign
                }

                // Run through each day…
                [...week.querySelectorAll('calendar-day')].forEach(
                    (day) => {
                        if (withinMonth === false) {
                            day.textContent = ''; // eslint-disable-line no-param-reassign
                            day.removeAttributes();

                            return;
                        }

                        day.textContent = currentDate.format('DD'); // eslint-disable-line no-param-reassign
                        day.setAttribute('diff', currentDate.diff(today, 'days'));

                        if (currentDate.isSame(today, 'day')) {
                            day.setAttribute('today', '');
                        } else {
                            day.removeAttribute('today');
                        }

                        if (currentDate.month() !== moment.month()) {
                            day.setAttribute('muted', '');
                        } else {
                            day.removeAttribute('muted');
                        }

                        currentDate.add(1, 'days');
                    }
                );
            }
        );
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
CalendarWeeks.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('calendar-weeks', CalendarWeeks);
