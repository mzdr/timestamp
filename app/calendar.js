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
        this._window = new Electron.BrowserWindow({
            width: 368,
            height: 388,
            frame: false,
            resizable: false,
            alwaysOnTop: true,
            show: false
        });

        // Load the contents aka the view
        this._window.loadURL(`file://${__dirname}/calendar.html`);

        // Register onBlur callback
        this._window.on('blur', (e) => this.onBlur(e));

        // Provide locale detection
        Electron.ipcMain.on(
            'calendar.locale',
            (e) => e.returnValue = this.app.getLocale()
        );

        // Calendar view is ready and idling now
        Electron.ipcMain.on('calendar.idle', () => {
            this.onDarkModeChanged(this.app.isDarkMode());
        });
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
        this._window.webContents.send('calendar.darkmode', darkMode);
    }

    /**
     * Provide static render function to execute logic in renderer process.
     */
    static render()
    {
        // Watch for dark mode changes
        Electron.ipcRenderer.on(
            'calendar.darkmode', (e, darkMode) => this.toggleDarkMode(darkMode)
        );

        // Set locale for Moment.js
        Moment.locale(Electron.ipcRenderer.sendSync('calendar.locale'));

        let calendar = Moment();

        // Assign click handling logic to calendar actions
        document.addEventListener('click', (e) => {
            let el = e.target;

            if (el.matches('[data-calendar-today]')) {
                calendar = Moment();
            } else if (el.matches('[data-calendar-next]')) {
                calendar.add(1, 'month');
            } else if (el.matches('[data-calendar-prev]')) {
                calendar.subtract(1, 'month');
            } else {
                return;
            }

            this.draw(calendar);
        });

        // Draw for the first time
        this.draw(calendar);

        // Redraw every minute to avoid displaying old/wrong states
        setInterval(() => this.draw(calendar), 1000 * 60);

        // Idling now…
        Electron.ipcRenderer.send('calendar.idle');
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
        const legend = this.getWeekNode();

        // Build weekdays legend
        Moment.weekdaysShort().forEach((weekday) => {
            let day = this.getDayNode();

            legend.classList.add('-weekdays');
            legend.appendChild(day);

            day.classList.add('-weekday');
            day.textContent = weekday;
        });

        return legend;
    }

    /**
     * Draws the actual calendar.
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
    }

    /**
     * When the dark mode is being changed we need to adjust the styles by
     * adding or removing the dark-mode class to the root DOM element.
     *
     * @param {boolean} darkMode Enable/disable dark mode styles.
     */
    static toggleDarkMode(darkMode)
    {
        document.documentElement.classList[
            darkMode ? 'add' : 'remove'
        ]('dark-mode');
    }
}

module.exports = Calendar;
