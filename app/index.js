const {
  app, screen, ipcMain, BrowserWindow,
} = require('electron');

const { arch, platform, release } = require('os');
const { resolve } = require('path');
const { parseInline } = require('marked');

const Calendar = require('./components/Calendar');
const Clock = require('./components/Clock');
const Locale = require('./components/Locale');
const Logger = require('./components/Logger');
const Preferences = require('./components/Preferences');
const SystemTray = require('./components/SystemTray');
const Updater = require('./components/Updater');
const { PREFERENCES_CHANGED } = require('./views/preferences/ipc');
const { integratedBackgroundsDirectory } = require('./paths');

const {
  APP_IS_PACKAGED,
  APP_QUIT,
  APP_RESIZE_WINDOW,
  APP_RESTART,
  APP_TICK,
  APP_TRANSLATE,
  APP_UPDATE_DOWNLOADED,
} = require('./ipc');

const defaultPreferences = {
  calendarBackground: resolve(integratedBackgroundsDirectory, 'gradient.svg'),
  calendarLegendFormat: 'MMMM  y',
  calendarTodayFormat: 'EEEE,\ndo MMMM',
  clockFormat: 'PPPP',
  openAtLogin: false,
};

(async () => {
  await app.whenReady();

  app.dock.hide();

  return new class {
    constructor() {
      const currentVersion = app.getVersion();

      this.logger = new Logger();

      this.logger.debug(`Starting Timestamp v${currentVersion} on “${platform()}-${arch()} v${release()}”.`);
      this.logger.debug(`Running in ${app.isPackaged ? 'production' : 'development'} mode.`);

      if (app.isPackaged) {
        this.updater = new Updater({
          currentVersion,
          feedUrl: 'https://mzdr.github.io/timestamp/update.json',
          logger: this.logger,
          onUpdateDownloaded: this.onUpdateDownloaded.bind(this),
        });
      }

      this.locale = new Locale({
        logger: this.logger,
        preferred: app.getLocale(),
      });

      this.tray = new SystemTray({
        logger: this.logger,
        onClick: this.onTrayClicked.bind(this),
      });

      this.clock = new Clock({
        format: defaultPreferences.clockFormat,
        locale: this.locale,
        onTick: this.onTick.bind(this),
      });

      this.calendar = new Calendar({
        locale: this.locale,
        logger: this.logger,
      });

      this.preferences = new Preferences({
        defaults: defaultPreferences,
        logger: this.logger,
        onChange: this.onPreferencesChanged.bind(this),
      });

      ipcMain.handle(APP_IS_PACKAGED, () => app.isPackaged);
      ipcMain.handle(APP_TRANSLATE, this.onTranslate.bind(this));
      ipcMain.on(APP_QUIT, () => app.exit());
      ipcMain.on(APP_RESIZE_WINDOW, this.onResizeWindow.bind(this));
      ipcMain.on(APP_RESTART, this.onRestart.bind(this));
    }

    onRestart() {
      if (this.updater === undefined) {
        return this;
      }

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
      } else if (/^calendar/.test(key)) {
        this.calendar.window.getWebContents().send(PREFERENCES_CHANGED, key, value);
      }

      return this;
    }

    onTick(clock) {
      this.tray.setLabel(clock.toString());
      this.calendar?.window.getWebContents().send(APP_TICK, clock.now);
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
