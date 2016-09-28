class Calendar
{
    constructor()
    {
        const template = this.constructor.document.querySelector('template');
        const clone = document.importNode(template.content, true);

        // Append calendar markup
        document.body.appendChild(clone);

        this.view = document.querySelector('calendar-view');
        this.content = document.querySelector('calendar-content');
        this.gotomonth = document.querySelector('calendar-goto-month');
        this.gotoyear = document.querySelector('calendar-goto-year');
        this.weekdays = document.querySelector('calendar-weekdays');

        // TODO: Refactor?
        document.querySelector('[data-show-preferences]').addEventListener(
            'click', () => Electron.ipcRenderer.send('preferences.show')
        );

        // This Moment.js instance is used for all calcuations, when it's being
        // created it represents 12am of today
        this.moment = Moment().startOf('date');

        // Register all UI related event listeners
        CalendarEvent.on('goto.today', () => this.goToToday());
        CalendarEvent.on('goto.month', (e) => this.goToMonth(e));
        CalendarEvent.on('goto.year', (e) => this.goToYear(e));
        CalendarEvent.on('day.clicked', (e) => this.dayClicked(e));

        // Draw for the first time
        this.update();

        // Redraw calendar every minute to avoid displaying old/wrong states
        setInterval(() => this.update(), 1000 * 60);
    }

    /**
     * Calendar has been changed, time to update all the components.
     *
     * @return {Calendar}
     */
    update()
    {
        this.content.draw(this.moment);
        this.gotomonth.draw(this.moment.month());
        this.gotoyear.draw(this.moment.year());
        this.weekdays.draw(this.moment.weekday());

        // Set window size dynamically
        Electron.remote.getCurrentWindow().setSize(
            document.body.offsetWidth,
            document.body.offsetHeight,
            true
        );

        return this;
    }

    /**
     * Jump to today.
     *
     * @return {Calendar}
     */
    goToToday()
    {
        const now = Moment();

        this.moment.set({
            'year': now.year(),
            'month': now.month(),
            'day': now.day()
        });

        return this.update();
    }

    /**
     * Jump to the given month.
     *
     * @param {number} month Given month.
     * @return {Calendar}
     */
    goToMonth({ detail: { month } })
    {
        this.moment.month(month);

        return this.update();
    }

    /**
     * Jump to the given year.
     *
     * @param {number} year Given year.
     * @return {Calendar}
     */
    goToYear({ detail: { year } })
    {
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
    dayClicked({ detail: { diff } })
    {
        if (diff) {
            Electron.ipcRenderer.send('calendar.open', diff);
        }

        return this;
    }
}

Calendar.document = document.currentScript.ownerDocument;
