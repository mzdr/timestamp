const Electron = require('electron');
const AppleScript = require('applescript');

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

        // Provide link to macOS calendar app
        Electron.ipcMain.on('calendar.open', (e, daysFromToday) =>
            this.openDayInMacOSCalendar(daysFromToday)
        );
    }

    /**
     * A day has been clicked in the calendar overview. In our case we are
     * going to open the clicked day in the macOS calendar app.
     *
     * @param {number} daysFromToday Amount of days from today.
     * @return {Calendar}
     */
    openDayInMacOSCalendar(daysFromToday)
    {
        if (this.app.preferences.get('clickingDateOpensCalendar') === false) {
            return;
        }

        const script = `
            tell application "Calendar"
                set requestedDate to (current date) + (${daysFromToday} * days)
                switch view to day view
                view calendar at requestedDate
            end tell
        `;

        AppleScript.execString(script, (error) => {
            if (error && this.app.debug) {
                console.log(error);
            }
        });

        return this;
    }
}

module.exports = Calendar;
