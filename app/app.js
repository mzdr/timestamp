const Electron = require('electron');
const Path = require('path');
const AutoLaunch = require('auto-launch');
const Tray = require('./tray');
const Clock = require('./clock');
const Preferences = require('./preferences');
const Calendar = require('./calendar');
const Updater = require('./updater');
const Translator = require('./translator');
const About = require('./about');

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
        this.about = new About(this);

        // Initialize tray related things
        this.initTray();

        // Check for update on startup
        this.handleUpdateCheckingProcess();

        // Dark mode was changed
        this.onDarkModeChanged((darkMode) => {
            this.calendar.onDarkModeChanged(darkMode);
        });
    }

    /**
    * Initialize everything that belongs to the tray.
    */
    initTray()
    {
        // Hook clock tick with tray label
        this.clock.onTick((clock) => {
            this.tray.setLabel(clock.toString());
        });

        // Show calendar when clicking on tray icon
        this.tray.onClick(() => {
            const bounds = this.tray.getBounds();

            this.calendar.setPosition(bounds.x + bounds.width / 2, 0);

            if (this.calendar.isVisible()) {
                this.calendar.hide();
            } else {
                this.calendar.show();
            }
        });

        // Set up menu items
        this.tray.onQuitClicked(() => Electron.app.quit());
        this.tray.onAboutClicked(() => this.about.show());
        this.tray.onPreferencesClicked(() => this.preferences.show());
        this.tray.onCheckForUpdateClicked(() => this.handleUpdateCheckingProcess());
        this.tray.onRestartAndInstallUpdate(() => this.updater.quitAndInstall());
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
            startAtLogin: false
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
    * Calls a given callback when dark mode in macOS is being enabled/disabled.
    *
    * @see http://electron.atom.io/docs/api/system-preferences/#systempreferencessubscribenotificationevent-callback-macos
    * @param {Function} callback
    */
    onDarkModeChanged(callback)
    {
        Electron.systemPreferences.subscribeNotification(
            'AppleInterfaceThemeChangedNotification',
            () => callback(this.isDarkMode())
        );
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
                if (this.debug === false) {
                    console.log(error);
                }
            });
    }
}

module.exports = App;
