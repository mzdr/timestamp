const {
  app, screen, ipcMain, BrowserWindow,
} = require('electron');

const Calendar = require('./components/Calendar');
const Clock = require('./components/Clock');
const Locale = require('./components/Locale');
const Preferences = require('./components/Preferences');
const SystemTray = require('./components/SystemTray');

(async () => {
  await app.whenReady();

  return new class {
    constructor() {
      app.dock.hide();

      this.locale = new Locale({
        preferred: app.getLocale(),
      });

      this.tray = new SystemTray({
        onClick: this.onTrayClicked.bind(this),
      });

      this.clock = new Clock({
        onTick: this.tray.setLabel.bind(this.tray),
        locale: this.locale,
      });

      this.calendar = new Calendar({
        locale: this.locale,
      });

      this.preferences = new Preferences({
        locale: this.locale,
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
        .setSize(width, height);
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
