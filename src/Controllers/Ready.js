const Electron = require('electron');
const Path = require('path');

class Ready
{
    /**
     * Creates an instance of the Ready controller.
     *
     * @param {App} app The app instance.
     * @return {Ready}
     */
    constructor(app)
    {
        // Hide dock icon
        Electron.app.dock.hide();

        // Set path to views directory
        app.viewsDir = 'file://' + Path.normalize(`${__dirname}/../Views`);

        // Create tray
        app.tray = new (require('../Components/Tray'))(app);

        // Create clock
        app.clock = new (require('../Components/Clock'))(app);

        // Create preferences
        app.preferences = new (require('../Components/Preferences'))(app);

        // Create calendar
        app.calendar = new (require('../Components/Calendar'))(app);

        // Hook clock tick with tray label
        app.clock.onTick = (clock) => {
            app.tray.label = clock.toString();
        }

        // Show calendar when clicking on tray icon
        app.tray.onClick = (e, bounds) => {
            app.calendar.setPosition(bounds.x || 0, bounds.y || 0);
            app.calendar.show();
        };

        // Glue tray menu items with app components
        app.tray.onPreferencesClicked = () => app.preferences.show();
        app.tray.onQuitClicked = () => Electron.app.quit();

        // Synchronize preferences with clock
        app.preferences.onChange = (format) => app.clock.format = format;
    }
}

module.exports = Ready;
