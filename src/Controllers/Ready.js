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

        // Quit the app
        this.app.tray.onQuitClicked(() => Electron.app.quit());

        // Show preferences
        this.app.tray.onPreferencesClicked(() => {
            const bounds = this.app.tray.getBounds();

            this.app.preferences.setPosition(bounds.x + bounds.width / 2, 0);
            this.app.preferences.show();
        });

        // Check for update menu item has been clicked
        this.app.tray.onCheckForUpdateClicked(
            (item) => this.handleUpdateCheckingProcess(item)
        );

        // Restart and install update
        this.app.tray.onRestartAndInstallUpdate(
            () => this.app.updater.quitAndInstall()
        );
    }

    /**
     * Handles the update checking process by showing and hiding relevant
     * menu items.
     *
     * @param {MenuItem} checkForUpdateItem The clicked menu item.
     */
    handleUpdateCheckingProcess(checkForUpdateItem)
    {
        let restartAndInstallUpdateItem = this.app.tray.getMenuItem('restartAndInstallUpdate');
        let youAreUpToDateItem = this.app.tray.getMenuItem('youAreUpToDate');
        let downloadingUpdateItem = this.app.tray.getMenuItem('downloadingUpdate');
        let downloadingUpdateFailedItem = this.app.tray.getMenuItem('downloadingUpdateFailed');

        // Disable the check for update menu item to avoid running into
        // multiple checks
        checkForUpdateItem.enabled = false;

        // Run the updater to see if there is an update
        this.app.updater.checkForUpdate()

            // We have an update!
            .then(() => {

                // Tell user we are downloading the update
                downloadingUpdateItem.visible = true;
                checkForUpdateItem.visible = false;
                checkForUpdateItem.enabled = true;

                // Wait for the download to finish
                this.app.updater.onUpdateDownloaded()

                    // Enable the restart and install update menu item
                    .then(() => {
                        downloadingUpdateItem.visible = false;
                        restartAndInstallUpdateItem.visible = true;
                    })

                    // Failed to download update
                    .catch(() => {
                        downloadingUpdateFailedItem.visible = true;
                        downloadingUpdateItem.visible = false;

                        // Enable check for update after 1 min
                        setTimeout(() => {
                            checkForUpdateItem.visible = true;
                            downloadingUpdateFailedItem.visible = false;
                        }, 1000 * 60);
                    });
            })

            // Nope, all up to date
            .catch(() => {
                youAreUpToDateItem.visible = true;
                checkForUpdateItem.visible = false;
                checkForUpdateItem.enabled = true;

                // Enable check for update after 1 min
                setTimeout(() => {
                    checkForUpdateItem.visible = true;
                    youAreUpToDateItem.visible = false;
                }, 1000 * 60);
            });
    }
}

module.exports = Ready;
