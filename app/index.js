const {
  app, screen, ipcMain, BrowserWindow,
} = require('electron');

const CalendarView = require('./views/calendar/CalendarView');
const Clock = require('./Clock');
const Locale = require('./Locale');
const PreferencesView = require('./views/preferences/PreferencesView');
const SystemTray = require('./SystemTray');

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

      this.calendarView = new CalendarView({
        locale: this.locale,
      });

      this.preferencesView = new PreferencesView({
        locale: this.locale,
      });

      ipcMain.on('quit', () => app.exit());
      ipcMain.on('resizeWindow', this.onResizeWindow.bind(this));
      ipcMain.on('showPreferences', this.onShowPreferences.bind(this));
    }

    onResizeWindow({ sender }, { width, height }) {
      const { calendarView, preferencesView } = this;
      const window = BrowserWindow.fromWebContents(sender);

      [calendarView, preferencesView]
        .find((view) => view.window.isSame(window))
        .window
        .setSize(width, height);
    }

    onShowPreferences() {
      return this.preferencesView.window.show();
    }

    onTrayClicked() {
      const { calendarView, tray } = this;
      const bounds = tray.getBounds();
      const currentMousePosition = screen.getCursorScreenPoint();
      const currentDisplay = screen.getDisplayNearestPoint(currentMousePosition);
      const yOffset = 6;

      calendarView
        .window
        .setPosition(bounds.x + (bounds.width / 2), currentDisplay.workArea.y + yOffset)
        .toggleVisibility();
    }
  }();
})();
