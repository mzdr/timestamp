const Electron = require('electron');
const Path = require('path');

class Ready
{
    /**
     * This class will be instantiated when Electron has finished
     * initialization and is ready to create browser windows.
     *
     * @param {App} app The app instance.
     * @return {Ready}
     */
    constructor(app)
    {
        // Remember app instance
        this.app = app;

        // Hide dock icon
        Electron.app.dock.hide();

        // Get current locale
        this.app.locale = Electron.app.getLocale() || 'en';

        // OSX: In dark mode?
        this.app.darkMode = Electron.systemPreferences.isDarkMode();

        // Set path to views directory
        this.app.viewsDir = 'file://' + Path.normalize(`${__dirname}/../Views`);

        // Provide access to several app related settings in renderer process
        Electron.ipcMain.on('app.locale', (e) => e.returnValue = this.app.locale);
        Electron.ipcMain.on('app.darkmode', (e) => e.returnValue = this.app.darkMode);
        Electron.ipcMain.on('preferences.get', (e) => e.returnValue = this.app.preferences.get());

        // We are going to need those components
        const components = [ 'Tray', 'Clock', 'Preferences', 'Calendar' ];

        // Create all of them and attach them to the app instance
        components.forEach((component) => {
            this.app[component.toLowerCase()] = new (
                require(`../Components/${component}`)
            )(this.app);
        });

        // Initialize tray related things
        this.initTray();

        // Synchronize preferences with several components
        Electron.ipcMain.on(
            'preferences.set',
            (e, data) => this.preferencesChanged(data)
        );
    }

    /**
     * Initialize everything that belongs to the tray.
     */
    initTray()
    {
        // Hook clock tick with tray label
        this.app.clock.onTick = (clock) => {
            this.app.tray.label = clock.toString();
        }

        // Show calendar when clicking on tray icon
        this.app.tray.onClick = () => {
            let bounds = this.app.tray.getBounds();

            this.app.calendar.setPosition(bounds.x + bounds.width / 2, 0);

            if (this.app.calendar.isVisible()) {
                this.app.calendar.hide();
            } else {
                this.app.calendar.show();
            }
        };

        // Glue tray menu items with app components
        this.app.tray.onQuitClicked = () => Electron.app.quit();
        this.app.tray.onPreferencesClicked = () => {
            let bounds = this.app.tray.getBounds();

            this.app.preferences.setPosition(bounds.x + bounds.width / 2, 0);
            this.app.preferences.show();
        };
    }

    /**
     * Handle change of preferences.
     *
     * @param {object} data New preferences.
     */
    preferencesChanged(data)
    {
        // We have a new clock format
        if (data.clockFormat !== this.app.clock.format) {
            this.app.clock.format = data.clockFormat;
        }

        // Save them here…
    }
}

module.exports = Ready;
