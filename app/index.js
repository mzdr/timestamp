const {
  app, screen, ipcMain, BrowserWindow,
} = require('electron');

const { arch, platform, release } = require('os');
const { parseInline } = require('marked');

const Calendar = require('./components/Calendar');
const Clock = require('./components/Clock');
const Locale = require('./components/Locale');
const Logger = require('./components/Logger');
const Preferences = require('./components/Preferences');
const SystemTray = require('./components/SystemTray');
const Updater = require('./components/Updater');

const {
  APP_QUIT,
  APP_RESIZE_WINDOW,
  APP_RESTART,
  APP_TRANSLATE,
  APP_UPDATE_DOWNLOADED,
} = require('./ipc');

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
      const storagePath = app.getPath('userData');

      this.logger = new Logger({
        storagePath,
      });

      this.logger.debug(`Starting Timestamp v${currentVersion} on “${platform()}-${arch()} v${release()}”.`);
      this.logger.debug(`Running in ${app.isPackaged ? 'production' : 'development'} mode.`);

      if (app.isPackaged) {
        this.updater = new Updater({
          feedUrl: 'https://mzdr.github.io/timestamp/update.json',
          logger: this.logger,
          onUpdateDownloaded: this.onUpdateDownloaded.bind(this),
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
        storagePath,
        defaults: defaultPreferences,
        logger: this.logger,
      });

      ipcMain.on(APP_QUIT, () => app.exit());
      ipcMain.on(APP_RESTART, this.onRestart.bind(this));
      ipcMain.on(APP_RESIZE_WINDOW, this.onResizeWindow.bind(this));
      ipcMain.handle(APP_TRANSLATE, this.onTranslate.bind(this));
    }

    onRestart() {
      this.calendar.window.destroy();
      this.preferences.window.destroy();
      this.updater.quitAndInstall();

      return this;
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

    onTranslate(event, key, options = {}) {
      const { markdown = false } = options;
      const translation = this.locale.translate(key);

      if (markdown) {
        return parseInline(translation);
      }

      return translation;
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

    onUpdateDownloaded() {
      this.tray.setPrefix('→ ');
      this.preferences.window.getWebContents().send(APP_UPDATE_DOWNLOADED);
      this.calendar.window.getWebContents().send(APP_UPDATE_DOWNLOADED);
    }
  }();
})();
