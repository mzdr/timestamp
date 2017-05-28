/* global document, customElements, BaseElement, Moment, Electron, CalendarEvent, requestAnimationFrame */

const AppleScript = require('applescript');

class CalendarView extends BaseElement {
    constructor() {
        super().fetchTemplate();

        this.$today = this.shadowRoot.querySelector('calendar-today');
        this.$legend = this.shadowRoot.querySelector('calendar-legend');
        this.$weeks = this.shadowRoot.querySelector('calendar-weeks');
        this.$weekdays = this.shadowRoot.querySelector('calendar-weekdays');
        this.$navigation = this.shadowRoot.querySelector('calendar-navigation');

        // This Moment.js instance is used for all calcuations, when it’s being
        // created it represents 12am of today
        this.moment = Moment().startOf('date');

        // Register all UI related event listeners
        CalendarEvent.on('goto.today', e => this.goToToday(e));
        CalendarEvent.on('goto.month', e => this.goToMonth(e));
        CalendarEvent.on('goto.year', e => this.goToYear(e));
        CalendarEvent.on('day.clicked', e => this.dayClicked(e));

        // Redraw calendar every minute to avoid displaying old/wrong states
        setInterval(() => this.update(), 1000 * 60);

        const undefinedElements = this.shadowRoot.querySelectorAll(':not(:defined)');
        const whenDefined = [...undefinedElements].map(
            el => customElements.whenDefined(el.localName)
        );

        // Wait for all the elements to be upgraded.
        Promise.all(whenDefined).then(() => {
            this.update();
        });
    }

    /**
     * Calendar has been changed, time to update all the components.
     *
     * @return {Calendar}
     */
    update() {
        this.$today.draw();
        this.$legend.draw(this.moment.format('MM'), this.moment.format('YYYY'));
        this.$weeks.draw(this.moment);
        this.$navigation.draw(this.moment);
        this.$weekdays.draw(this.moment);

        // Set window size dynamically after repainting
        requestAnimationFrame(() => {
            Electron.remote.getCurrentWindow().setSize(
                document.body.offsetWidth || 100,
                document.body.offsetHeight || 100
            );
        });

        return this;
    }

    /**
     * Jump to today.
     *
     * @return {Calendar}
     */
    goToToday() {
        const now = Moment();

        this.moment.set({
            year: now.year(),
            month: now.month(),
            day: now.day()
        });

        return this.update();
    }

    /**
     * Jump to the given month.
     *
     * @param {number} month Given month.
     * @return {Calendar}
     */
    goToMonth({ detail: { month } }) {
        this.moment.month(month);

        return this.update();
    }

    /**
     * Jump to the given year.
     *
     * @param {number} year Given year.
     * @return {Calendar}
     */
    goToYear({ detail: { year } }) {
        this.moment.year(year);

        return this.update();
    }

    /**
     * A day has been clicked. In our case we are going to open the day in the
     * macOS calendar app.
     *
     * @param {number} diff The difference in days to today.
     * @return {Calendar}
     */
    dayClicked({ detail: { diff } }) {
        Electron.ipcRenderer.on('preferences.get', (e, key, value) => {
            if (key !== 'clickingDateOpensCalendar' || value === false) {
                return;
            }

            const script = `
                tell application "Calendar"
                    set requestedDate to (current date) + (${diff} * days)
                    switch view to day view
                    view calendar at requestedDate
                end tell
            `;

            AppleScript.execString(script, (error) => {
                if (error) {
                    console.error(error);
                }
            });
        });

        Electron.ipcRenderer.send('preferences.get', 'clickingDateOpensCalendar');

        return this;
    }
}

// Remember document from import scope. Needed for accessing elements inside
// the imported html…
CalendarView.ownerDocument = document.currentScript.ownerDocument;

// @see https://developer.mozilla.org/docs/Web/API/CustomElementRegistry/define
customElements.define('calendar-view', CalendarView);
