const Electron = require('electron'); // eslint-disable-line
const Path = require('path');
const Tray = require('./tray');
const Clock = require('./clock');
const Preferences = require('./preferences');
const Updater = require('./updater');

class App {
    /**
    * Starts the Timestamp app.
    *
    * @return {App}
    */
    constructor() {
        // Hide dock icon
        Electron.app.dock.hide();

        // Create all necessary components
        this.tray = new Tray(this);
        this.clock = new Clock(this);
        this.preferences = new Preferences(this);
        this.updater = new Updater(this);

        this.willQuit = false;

        // Register listeners for clock, tray, system notifications and so on…
        this.registerListeners();

        // Finally create the app window
        this.window = this.createWindow();

        // Everytime the app is started and all windows are ready,
        // check for updates…
        Promise.all(
            (Electron.webContents.getAllWebContents() || []).map(
                webContent => new Promise(
                    resolve => webContent.on('did-finish-load', resolve)
                )
            )
        ).then(() => this.checkForUpdate());
    }

    /**
    * Registers listeners for system notification, messages from the
    * renderer process, clock events and tray events.
    *
    * @return {App}
    */
    registerListeners() {
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
                bounds.x + (bounds.width / 2),
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
            () => this.onDarkModeChanged()
        );

        // Received request to check for updates…
        Electron.ipcMain.on('app.update.check', () => this.checkForUpdate());

        // Received request to update app…
        // If there is an update available we will update it right now!
        Electron.ipcMain.on('app.update.run', () => {
            const lastReponse = this.updater.getLastResponse();

            if (lastReponse && lastReponse.code < 0) {
                this.willQuit = true;

                Updater.quitAndInstall();
            }
        });

        // @see https://electron.atom.io/docs/api/app/#event-before-quit
        Electron.app.on('before-quit', () => (this.willQuit = true));

        return this;
    }

    /**
     * Runs the updater to check if there is an update for Timestamp.
     *
     * @return {App}
     */
    checkForUpdate() {
        const allWebContents = Electron.webContents.getAllWebContents() || [];

        this.updater
            .checkForUpdate()
            .then(update => allWebContents.forEach(
                webContent => webContent.send('app.update.check', update)
            ));

        return this;
    }

    /**
    * Handle change of preferences.
    *
    * @param {object} preferences New preferences.
    */
    onPreferencesChanged(preferences) {
        // We have a new clock format
        if (preferences.clockFormat !== this.clock.getFormat()) {
            this.clock.setFormat(preferences.clockFormat);
        }

        // Start at login has been changed
        if (preferences.startAtLogin !== Electron.app.getLoginItemSettings().openAtLogin) {
            Electron.app.setLoginItemSettings({
                openAtLogin: preferences.startAtLogin
            });
        }
    }

    /**
     * Called when the window loses focus. In our case once the user clicks
     * beside the app window, it will be hidden.
     */
    onBlur() {
        this.hide();
    }

    /**
     * When dark mode was changed we are going to recreate the application
     * window.
     *
     * @see http://electron.atom.io/docs/api/system-preferences/#systempreferencessubscribenotificationevent-callback-macos
     */
    onDarkModeChanged() {
        // Close old window
        this.window.close();

        // Recreate app window
        this.window = this.createWindow();
    }

    /**
     * Creates the actual app window.
     *
     * @return {BrowserWindow}
     */
    createWindow() {
        const win = new Electron.BrowserWindow({
            frame: false,
            resizable: false,
            alwaysOnTop: true,
            show: false
        });

        win.on('blur', () => this.onBlur())
           .loadURL(`file://${__dirname}/app.html`);

        return win;
    }

    /**
     * Shows the app window.
     *
     * @return {App}
     */
    show() {
        this.window.show();

        return this;
    }

    /**
     * Hides the app window.
     *
     * @return {App}
     */
    hide() {
        this.window.hide();

        return this;
    }

    /**
     * Returns a boolean, whether the window is visible to the user.
     *
     * @return {boolean}
     */
    isVisible() {
        return this.window.isVisible();
    }

    /**
     * Sets the position of the app window.
     *
     * @param {number} x Position on x-axis.
     * @param {number} y Position on y-axis.
     * @param {boolean} centerToX Center window to new x position or not.
     * @return {App}
     */
    setPosition(x, y, centerToX = true) {
        this.window.setPosition(
            centerToX ? Math.round(x - (this.window.getSize()[0] / 2)) : x,
            y
        );

        return this;
    }

    /**
    * Returns the default preferences for this app.
    *
    * @return {object}
    */
    static getDefaultPreferences() {
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
    static getUserPreferencesPath() {
        return Path.join(
            Electron.app.getPath('userData'),
            'UserPreferences.json'
        );
    }
}

module.exports = App;
