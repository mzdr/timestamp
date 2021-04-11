const { app, screen } = require('electron');

const CalendarView = require('./views/calendar/CalendarView');
const Clock = require('./Clock');
const Locale = require('./Locale');
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

      this.calendar = new CalendarView({
        locale: this.locale,
      });
    }

    onTrayClicked() {
      const { calendar, tray } = this;
      const bounds = tray.getBounds();
      const currentMousePosition = screen.getCursorScreenPoint();
      const currentDisplay = screen.getDisplayNearestPoint(currentMousePosition);
      const yOffset = 6;

      calendar.setPosition(bounds.x + (bounds.width / 2), currentDisplay.workArea.y + yOffset);
      calendar.toggleVisibility();
    }
  }();
})();
