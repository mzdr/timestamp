const { BrowserWindow, shell } = require('electron');

class Window {
  constructor(options = {}) {
    const defaults = {
      alwaysOnTop: true,
      frame: false,
      minimizable: false,
      resizable: false,
      show: false,
    };

    const {
      sourceFile,
      name,
      onReady,
      ...rest
    } = options;

    this.name = name;
    this.browserWindow = new BrowserWindow({ ...defaults, ...rest });

    if (typeof onReady === 'function') {
      this.browserWindow.on('ready-to-show', onReady);
    }

    // @see https://www.electronjs.org/docs/tutorial/security#12-disable-or-limit-navigation
    this.browserWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      event.preventDefault();

      if (/^https?:\/\//.test(navigationUrl)) {
        shell.openExternal(navigationUrl);
      }
    });

    // @see https://www.electronjs.org/docs/tutorial/security#13-disable-or-limit-creation-of-new-windows
    this.browserWindow.webContents.on('new-window', (event) => event.preventDefault());

    this
      .browserWindow
      .on('close', this.onClose.bind(this))
      .loadFile(sourceFile);
  }

  isSame(window) {
    return window === this.browserWindow;
  }

  destroy() {
    this.browserWindow.destroy();

    return this;
  }

  show() {
    this.browserWindow.webContents.send(`${this.name}.show`);
    this.browserWindow.show();

    return this;
  }

  hide() {
    this.browserWindow.webContents.send(`${this.name}.hide`);
    this.browserWindow.hide();

    return this;
  }

  toggleVisibility() {
    return this.isVisible() ? this.hide() : this.show();
  }

  isVisible() {
    return this.browserWindow.isVisible();
  }

  onClose(event) {
    this.hide();

    // By default all windows in Timestamp are hidden and not closed
    event.preventDefault();
  }

  getBrowserWindow() {
    return this.browserWindow;
  }

  getWebContents() {
    return this.browserWindow.webContents;
  }

  getContentSize() {
    return this.browserWindow.getContentSize();
  }

  setContentSize(width, height) {
    if (typeof width !== 'number' || typeof height !== 'number') {
      console.warn('Window.setContentSize has been call with non-numeric arguments.');

      return this;
    }

    this.browserWindow.setContentSize(width, height, true);

    return this;
  }

  getPosition() {
    return this.browserWindow.getPosition();
  }

  setPosition(x, y, centerToX = true) {
    this.browserWindow.setPosition(
      centerToX ? Math.round(x - (this.browserWindow.getSize()[0] / 2)) : x,
      y,
    );

    return this;
  }
}

module.exports = Window;
