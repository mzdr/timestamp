const Moment = require('moment');
const Electron = require('electron');

class Calendar
{
    /**
    * Creates a Calendar instance.
    *
    * @return {Calendar}
    */
    constructor(app)
    {
        // Remember app instance
        this.app = app;

        // Create window instance
        this._window = this.createWindow({
            darkMode: this.app.isDarkMode()
        });

        // Provide locale detection
        Electron.ipcMain.on('calendar.locale', (e) =>
            e.returnValue = this.app.getLocale()
        );

        // Provide dark mode detection
        Electron.ipcMain.on('calendar.darkmode', (e) =>
            e.returnValue = this.app.isDarkMode()
        );
    }

    /**
     * Creates the actual calendar window.
     *
     * @param {boolean} darkMode Are we in dark mode?
     * @return {BrowserWindow}
     */
    createWindow({
        darkMode = false
    } = {})
    {
        const win = new Electron.BrowserWindow({
            frame: false,
            resizable: false,
            alwaysOnTop: true,
            show: false,

            // Keep in sync with generic.css
            backgroundColor: darkMode ? '#333' : '#fafafa'
        });

        // Load the contents aka the view
        win.loadURL(`file://${__dirname}/calendar.html`);

        // Register onBlur callback
        win.on('blur', () => this.onBlur());

        return win;
    }

    /**
     * Shows the calendar window.
     */
    show()
    {
        this._window.show();
    }

    /**
     * Hides the calendar window.
     */
    hide()
    {
        this._window.hide();
    }

    /**
     * Returns a boolean, whether the window is visible to the user.
     *
     * @return {boolean}
     */
    isVisible()
    {
        return this._window.isVisible();
    }

    /**
     * Sets the position of the calendar window.
     *
     * @param {number} x Position on x-axis.
     * @param {number} y Position on y-axis.
     * @param {boolean} centerToX Center window to new x position or not.
     */
    setPosition(x, y, centerToX = true)
    {
        if (centerToX) {
            x = Math.round(x - this._window.getSize()[0] / 2);
        }

        this._window.setPosition(x, y);
    }

    /**
     * Called when the window loses focus. In our case once the user clicks
     * beside the calendar window, it will be hidden.
     */
    onBlur()
    {
        this.hide();
    }

    /**
     * When dark mode was change notify the renderer process.
     *
     * @param {bool} darkMode If dark mode is enabled or disabled.
     */
    onDarkModeChanged(darkMode)
    {
        // Close old window
        this._window.close();

        // Recreate calendar window with dark mode settings
        this._window = this.createWindow({
            darkMode: darkMode
        });
    }

    /**
     * Provide static render function to execute logic in renderer process.
     */
    static render()
    {
        const locale = Electron.ipcRenderer.sendSync('calendar.locale');
        const darkMode = Electron.ipcRenderer.sendSync('calendar.darkmode');

        // Set locale for Moment.js
        Moment.locale(locale);

        // The main Moment instance that's responsible for the calendar view
        const calendar = Moment();

        // We are in dark mode
        if (darkMode) {
            document.documentElement.classList.add('dark-mode');
        }

        // Assign click handling logic to calendar actions
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-calendar-today]')) {
                this.goToToday(calendar);
            } else if (e.target.matches('[data-calendar-next]')) {
                this.nextMonth(calendar);
            } else if (e.target.matches('[data-calendar-prev]')) {
                this.previousMonth(calendar);
            }
        });

        // Add ability to change the calendar by pressing keys
        window.addEventListener('keydown', (e) => {

            // Should do nothing if the key event was already consumed.
            if (e.defaultPrevented) {
                return;
            }

            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                this.goToToday(calendar);
            } else if (e.key === 'ArrowRight') {
                this.nextMonth(calendar);
            } else if (e.key === 'ArrowLeft') {
                this.previousMonth(calendar);
            } else {
                return;
            }

            // Consume the event to avoid it being handled twice
            e.preventDefault();
        }, true);

        // Draw for the first time
        this.draw(calendar);

        // Redraw every minute to avoid displaying old/wrong states
        setInterval(() => this.draw(calendar), 1000 * 60);
    }

    /**
     * Changes the given calendar to the next month.
     *
     * @param {Moment} calendar
     */
    static nextMonth(calendar)
    {
        calendar.add(1, 'month');
        this.draw(calendar);
    }

    /**
     * Changes the given calendar to the previous month.
     *
     * @param {Moment} calendar
     */
    static previousMonth(calendar)
    {
        calendar.subtract(1, 'month');
        this.draw(calendar);
    }

    /**
     * Changes the given calendar to today.
     *
     * @param {Moment} calendar
     */
    static goToToday(calendar)
    {
        let now = Moment();

        calendar.set({
            'year': now.year(),
            'month': now.month(),
            'day': now.day()
        });

        this.draw(calendar);
    }

    /**
     * Returns the week template node ready for injection.
     */
    static getWeekNode()
    {
        return document.querySelector('[data-template-calendar-week]')
            .content
            .cloneNode(true)
            .querySelector('[data-calendar-week]');
    }

    /**
     * Returns the day template node ready for injection.
     */
    static getDayNode()
    {
        return document.querySelector('[data-template-calendar-day]')
            .content
            .cloneNode(true)
            .querySelector('[data-calendar-day]');
    }

    /**
     * Returns a legend in form of all weekdays.
     */
    static getWeekdaysLegend()
    {
        const startOfWeek = Moment().startOf('week');
        const legend = this.getWeekNode();

        // Build weekdays legend
        for (var i = 0; i < 7; i++) {
            let day = this.getDayNode();

            legend.classList.add('-weekdays');
            legend.appendChild(day);

            day.classList.add('-weekday');
            day.textContent = startOfWeek.format('ddd');
            startOfWeek.add(1, 'day');
        }

        return legend;
    }

    /**
     * Draws the actual calendar.
     *
     * @param {Moment} calendar Current calendar instance.
     */
    static draw(calendar)
    {
        // Fetch DOM nodes
        const overview = document.querySelector('[data-calendar-overview]');
        const monthLabel = document.querySelector('[data-calendar-month]');
        const yearLabel = document.querySelector('[data-calendar-year]');

        // Prepare Moment instances
        const [year, month] = [calendar.year(), calendar.month()];
        const current = Moment([year, month]);
        const lastDate = Moment(current).endOf('month').weekday(6);
        const today = Moment();

        let week;

        // Update labels
        monthLabel.textContent = current.format('MMMM');
        yearLabel.textContent = current.format('YYYY');

        // Set back to start of the week
        current.weekday(0);

        // Clean up old days
        while (overview.firstChild) {
            overview.removeChild(overview.firstChild);
        }

        // Build weekdays legend
        overview.appendChild(this.getWeekdaysLegend());

        do {
            let day = this.getDayNode();

            // New week
            if (current.weekday() === 0) {
                week = this.getWeekNode();
                overview.appendChild(week);
            }

            // Add muted state to days not within the requested month
            if (current.month() !== month) {
                day.classList.add('-muted');
            }

            // Add active state to today and week
            if (current.isSame(today, 'day')) {
                week.classList.add('-current');
                day.classList.add('-today');
            }

            day.textContent = current.format('D');
            week.appendChild(day);

            // Next day
            current.add(1, 'days');

        } while (Moment.min(current, lastDate) === current);

        // Set window size dynamically
        Electron.remote.getCurrentWindow().setSize(
            document.body.offsetWidth,
            document.body.offsetHeight,
            true
        );
    }
}

module.exports = Calendar;
