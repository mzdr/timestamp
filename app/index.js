const {
  app, screen, ipcMain, BrowserWindow,
} = require('electron');

const { join } = require('path');
const { arch, platform, release } = require('os');

const Calendar = require('./components/Calendar');
const Clock = require('./components/Clock');
const Locale = require('./components/Locale');
const Logger = require('./components/Logger');
const Preferences = require('./components/Preferences');
const SystemTray = require('./components/SystemTray');
const Updater = require('./components/Updater');

const defaultPreferences = {
  openAtLogin: false,
  clockFormat: 'Pp',
};

(async () => {
  await app.whenReady();

  app.dock.hide();

  return new class {
    constructor() {
      const currentVersion = app.getVersion();

      this.logger = new Logger({
        filePath: join(app.getPath('userData'), 'Output.log'),
      });

      this.logger.debug(`Starting Timestamp v${currentVersion} on “${platform()}-${arch()} v${release()}”.`);
      this.logger.debug(`Running in ${app.isPackaged ? 'production' : 'development'} mode.`);

      if (app.isPackaged) {
        this.updater = new Updater({
          feedUrl: 'https://mzdr.github.io/timestamp/update.json',
          checkEvery: 1000 * 10,
          logger: this.logger,
          currentVersion,
        });
      }

      this.locale = new Locale({
        preferred: app.getLocale(),
        logger: this.logger,
      });

      this.tray = new SystemTray({
        onClick: this.onTrayClicked.bind(this),
        logger: this.logger,
      });

      this.clock = new Clock({
        onTick: this.tray.setLabel.bind(this.tray),
        locale: this.locale,
        format: defaultPreferences.clockFormat,
      });

      this.calendar = new Calendar({
        locale: this.locale,
        logger: this.logger,
      });

      this.preferences = new Preferences({
        onChange: this.onPreferencesChanged.bind(this),
        storagePath: join(app.getPath('userData'), 'UserPreferences.json'),
        defaults: defaultPreferences,
        logger: this.logger,
      });

      ipcMain.on('quit', () => app.exit());
      ipcMain.on('resizeWindow', this.onResizeWindow.bind(this));
      ipcMain.on('showPreferences', this.onShowPreferences.bind(this));
      ipcMain.handle('translate', this.onTranslate.bind(this));
    }

    onResizeWindow({ sender }, { width, height }) {
      const { calendar, preferences } = this;
      const window = BrowserWindow.fromWebContents(sender);

      [calendar, preferences]
        .find((view) => view.window.isSame(window))
        .window
        .setContentSize(width, height);
    }

    onPreferencesChanged(key, value) {
      if (key === 'openAtLogin') {
        app.setLoginItemSettings({ openAtLogin: value });
      } else if (key === 'clockFormat') {
        this.clock.setFormat(value);
      }

      return this;
    }

    onShowPreferences() {
      return this.preferences.window.show();
    }

    onTranslate(event, key) {
      return this.locale.translate(key);
    }

    onTrayClicked() {
      const { calendar, tray } = this;
      const bounds = tray.getBounds();
      const currentMousePosition = screen.getCursorScreenPoint();
      const currentDisplay = screen.getDisplayNearestPoint(currentMousePosition);
      const yOffset = 6;

      // Always center calendar window relative to tray icon
      calendar
        .window
        .setPosition(bounds.x + (bounds.width / 2), currentDisplay.workArea.y + yOffset)
        .toggleVisibility();
    }
  }();
})();
