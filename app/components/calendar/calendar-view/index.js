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
        this.$illustration = this.shadowRoot.querySelector('calendar-illustration');

        // This Moment.js instance is used for all calcuations, when it’s being
        // created it represents 12am of today
        this.moment = Moment().startOf('date');

        // Register all UI related event listeners
        CalendarEvent.on('goto.today', () => this.goToToday());
        CalendarEvent.on('goto.month', e => this.goToMonth(e.detail.month));
        CalendarEvent.on('goto.year', e => this.goToYear(e.detail.year));
        CalendarEvent.on('day.clicked', e => this.dayClicked(e.detail.diff));

        document.addEventListener('keydown', e => this.onKeyDown(e));

        // Redraw calendar every minute to avoid displaying old/wrong states
        setInterval(() => this.update(), 1000 * 60);

        // When all (custom) elements are defined, update the view
        this.whenElementsAreDefined(() => this.update());
    }

    /**
     * Calendar has been changed, time to update all the components.
     *
     * @return {CalendarView}
     */
    update() {
        this.$today.draw();
        this.$legend.draw(this.moment.format('MM'), this.moment.format('YYYY'));
        this.$weeks.draw(this.moment);
        this.$navigation.draw(this.moment);
        this.$weekdays.draw(this.moment);
        this.$illustration.draw();

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
     * A key has been pressed within the calendar view.
     *
     * @param {KeyboardEvent} e Original emitted event.
     * @return {CalendarView}
     */
    onKeyDown(e) {
        const currentMonth = this.moment.month();
        const currentYear = this.moment.year();

        // @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
        switch (e.key) {
            case 'ArrowRight':
                this.goToMonth(currentMonth + 1);
                break;

            case 'ArrowLeft':
                this.goToMonth(currentMonth - 1);
                break;

            case 'ArrowUp':
                this.goToYear(currentYear + 1);
                break;

            case 'ArrowDown':
                this.goToYear(currentYear - 1);
                break;

            case 'Escape':
                this.goToToday();
                break;

            default:
                return this;
        }

        return this;
    }

    /**
     * Jump to today.
     *
     * @return {CalendarView}
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
     * @return {CalendarView}
     */
    goToMonth(month) {
        this.moment.month(month);

        return this.update();
    }

    /**
     * Jump to the given year.
     *
     * @param {number} year Given year.
     * @return {CalendarView}
     */
    goToYear(year) {
        this.moment.year(year);

        return this.update();
    }

    /**
     * A day has been clicked. In our case we are going to open the day in the
     * macOS calendar app.
     *
     * @param {number} diff The difference in days to today.
     * @return {CalendarView}
     */
    dayClicked(diff) {
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
