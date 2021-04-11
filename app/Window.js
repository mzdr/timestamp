const { BrowserWindow, shell } = require('electron');

class Window {
  constructor(options = {}) {
    const defaults = {
      frame: false,
      resizable: false,
      alwaysOnTop: true,
      show: false,
      webPreferences: {},
    };

    const { sourceFile, ...rest } = options;

    this.window = new BrowserWindow({
      ...defaults,
      ...rest,
    });

    // @see https://www.electronjs.org/docs/tutorial/security#12-disable-or-limit-navigation
    this.window.webContents.on('will-navigate', (event) => event.preventDefault());

    // @see https://www.electronjs.org/docs/tutorial/security#13-disable-or-limit-creation-of-new-windows
    this.window.webContents.on('new-window', async (event, navigationUrl) => {
      event.preventDefault();

      await shell.openExternal(navigationUrl);
    });

    this
      .window
      .on('blur', this.onBlur.bind(this))
      .loadFile(sourceFile);
  }

  show() {
    this.window.show();

    return this;
  }

  hide() {
    this.window.hide();

    return this;
  }

  isVisible() {
    return this.window.isVisible();
  }

  onBlur() {
    this.window.hide();

    return this;
  }

  setPosition(x, y, centerToX = true) {
    this.window.setPosition(
      centerToX ? Math.round(x - (this.window.getSize()[0] / 2)) : x,
      y,
    );

    return this;
  }

  getPosition() {
    return this.window.getPosition();
  }
}

module.exports = Window;
