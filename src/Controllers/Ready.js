const Electron = require('electron');
const AutoLaunch = require('auto-launch');

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

        // Add auto start handler
        this.app.autoStart = new AutoLaunch({ name: Electron.app.getName() });

        // Create all of them and attach them to the app instance
        this.app.requiredComponents.forEach((component) => {
            this.app[component.toLowerCase()] = new (
                require(`${this.app.getComponentsDirectory()}/${component}`)
            )(this.app);
        });

        // Initialize tray related things
        this.initTray();

        // Dark mode was changed
        // this.app.onDarkModeChanged((darkMode) => {
        //     this.app.preferences.toggleDarkMode(darkMode);
        //     this.app.calendar.toggleDarkMode(darkMode);
        // });
    }

    /**
     * Initialize everything that belongs to the tray.
     */
    initTray()
    {
        // Hook clock tick with tray label
        this.app.clock.onTick((clock) => {
            this.app.tray.setLabel(clock.toString());
        });

        // Show calendar when clicking on tray icon
        this.app.tray.onClick(() => {
            const bounds = this.app.tray.getBounds();

            this.app.calendar.setPosition(bounds.x + bounds.width / 2, 0);

            if (this.app.calendar.isVisible()) {
                this.app.calendar.hide();
            } else {
                this.app.calendar.show();
            }
        });

        // Glue tray menu items with app components
        this.app.tray.onQuitClicked(() => Electron.app.quit());
        this.app.tray.onPreferencesClicked(() => {
            const bounds = this.app.tray.getBounds();

            this.app.preferences.setPosition(bounds.x + bounds.width / 2, 0);
            this.app.preferences.show();
        });
    }
}

module.exports = Ready;
