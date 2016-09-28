const Electron = require('electron');
const Path = require('path');
const AutoLaunch = require('auto-launch');
const Tray = require('./tray');
const Clock = require('./clock');
const Preferences = require('./preferences');
const Calendar = require('./calendar');
const Updater = require('./updater');
const Translator = require('./translator');

class App
{
    /**
    * Starts the Timestamp app.
    *
    * @return {App}
    */
    constructor()
    {
        // Check if we are in debug mode
        this.debug = process && process.env && process.env.DEBUG;

        // Hide dock icon
        Electron.app.dock.hide();

        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        Electron.app.on('window-all-closed', () => {});

        // Weird workaround for current bug in auto-launch
        // @see https://github.com/Teamwork/node-auto-launch/issues/28
        const launchOptions = {
            name: Electron.app.getName(),
            path: `${Electron.app.getPath('exe').split('.app/Content')[0]}.app`
        };

        // Create all necessary components
        this.startAtLogin = new AutoLaunch(launchOptions);
        this.translator = new Translator(this.getLocale());
        this.tray = new Tray(this);
        this.clock = new Clock(this);
        this.preferences = new Preferences(this);
        this.calendar = new Calendar(this);
        this.updater = new Updater(this);

        // Check for update on startup
        // this.handleUpdateCheckingProcess();

        // Register listeners for clock, tray, system nofitications and so on…
        this.registerListeners();

        // Finally create the app window
        this._window = this.createWindow({
            darkMode: this.isDarkMode()
        });
    }

    /**
    * Registers listeners for system notification, messages from the
    * renderer process, clock events and tray events.
    */
    registerListeners()
    {
        // Hook clock tick with tray label
        this.clock.onTick((clock) => {
            this.tray.setLabel(clock.toString());
        });

        // Show app when clicking on tray icon
        this.tray.onClick(() => {
            const bounds = this.tray.getBounds();
            const currentMousePosition = Electron.screen.getCursorScreenPoint();
            const currentDisplay = Electron.screen.getDisplayNearestPoint(currentMousePosition);

            this.setPosition(
                bounds.x + bounds.width / 2,
                currentDisplay.workArea.y
            );

            if (this.isVisible()) {
                this.hide();
            } else {
                this.show();
            }
        });

        // Listen for dark mode changed notification
        Electron.systemPreferences.subscribeNotification(
            'AppleInterfaceThemeChangedNotification',
            () => this.onDarkModeChanged(this.isDarkMode())
        );

        // Provide locale detection to renderer
        Electron.ipcMain.on('app.locale', (e) =>
            e.sender.send('app.locale', this.getLocale())
        );

        // Provide dark mode detection to renderer
        Electron.ipcMain.on('app.darkmode', (e) =>
            e.sender.send('app.darkmode', this.isDarkMode())
        );
    }

    /**
    * Handles the update checking process by showing and hiding relevant
    * menu items.
    */
    handleUpdateCheckingProcess()
    {
        let checkForUpdateItem = this.tray.getMenuItem('checkForUpdate');
        let restartAndInstallUpdateItem = this.tray.getMenuItem('restartAndInstallUpdate');
        let youAreUpToDateItem = this.tray.getMenuItem('youAreUpToDate');
        let downloadingUpdateItem = this.tray.getMenuItem('downloadingUpdate');
        let downloadingUpdateFailedItem = this.tray.getMenuItem('downloadingUpdateFailed');

        // Disable the check for update menu item to avoid running into
        // multiple checks
        checkForUpdateItem.enabled = false;

        // Run the updater to see if there is an update
        this.updater.checkForUpdate()

            // We have an update!
            .then(() => {

                // Tell user we are downloading the update
                downloadingUpdateItem.visible = true;
                checkForUpdateItem.visible = false;
                checkForUpdateItem.enabled = true;

                // Wait for the download to finish
                this.updater.onUpdateDownloaded()

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
            .catch((error) => {

                if (this.debug) {
                    console.log(error);
                }

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

    /**
    * Returns the current application locale.
    *
    * @see https://github.com/electron/electron/blob/master/docs/api/app.md#appgetlocale
    * @see https://github.com/electron/electron/blob/master/docs/api/locales.md
    * @return {string}
    */
    getLocale()
    {
        return Electron.app.getLocale() || 'en';
    }

    /**
    * Returns the default preferences for this app.
    *
    * @return {object}
    */
    getDefaultPreferences()
    {
        return {
            clockFormat: 'HH:mm:ss',
            startAtLogin: false,
            clickingDateOpensCalendar: true,
            showWeekOfYear: true
        };
    }

    /**
    * Returns the path to the file where all the user preferences are stored.
    *
    * @return {string}
    */
    getUserPreferencesPath()
    {
        return Path.join(
            Electron.app.getPath('userData'),
            'UserPreferences.json'
        );
    }

    /**
    * This method returns true if the system is in Dark Mode,
    * and false otherwise.
    *
    * @see http://electron.atom.io/docs/api/system-preferences/#systempreferencesisdarkmode-macos
    * @return {boolean}
    */
    isDarkMode()
    {
        return Electron.systemPreferences.isDarkMode();
    }

    /**
    * Handle change of preferences.
    *
    * @param {object} preferences New preferences.
    */
    onPreferencesChanged(preferences)
    {
        // We have a new clock format
        if (preferences.clockFormat !== this.clock.getFormat()) {
            this.clock.setFormat(preferences.clockFormat);
        }

        // Check if start at login was changed and enable/disable accordingly
        this.startAtLogin
            .isEnabled()
            .then((enabled) => {
                if (preferences.startAtLogin === enabled) {
                    return;
                }

                return this.startAtLogin[
                    preferences.startAtLogin ? 'enable' : 'disable'
                ]();
            })
            .catch((error) => {
                if (this.debug) {
                    console.log(error);
                }
            });
    }

    /**
     * Creates the actual app window.
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
            backgroundColor: darkMode ? '#333' : '#ffffff'
        });

        // Load the contents aka the view
        win.loadURL(`file://${__dirname}/app.html`);

        // Register onBlur callback
        win.on('blur', () => this.onBlur());

        return win;
    }

    /**
     * Shows the app window.
     */
    show()
    {
        this._window.show();
    }

    /**
     * Hides the app window.
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
     * Sets the position of the app window.
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
     * beside the app window, it will be hidden.
     */
    onBlur()
    {
        this.hide();
    }

    /**
     * When dark mode was changed we are going to recreate the application
     * window with it's appropriate settings.
     *
     * @see http://electron.atom.io/docs/api/system-preferences/#systempreferencessubscribenotificationevent-callback-macos
     * @param {bool} darkMode If dark mode is enabled or disabled.
     */
    onDarkModeChanged(darkMode)
    {
        // Close old window
        this._window.close();

        // Recreate app window with dark mode settings
        this._window = this.createWindow({
            darkMode: darkMode
        });
    }
}

module.exports = App;
