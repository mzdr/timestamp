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

    const { sourceFile, ...rest } = options;

    this.window = new BrowserWindow({ ...defaults, ...rest });

    // @see https://www.electronjs.org/docs/tutorial/security#12-disable-or-limit-navigation
    this.window.webContents.on('will-navigate', (event) => event.preventDefault());

    // @see https://www.electronjs.org/docs/tutorial/security#13-disable-or-limit-creation-of-new-windows
    this.window.webContents.on('new-window', async (event, navigationUrl) => {
      event.preventDefault();

      await shell.openExternal(navigationUrl);
    });

    this
      .window
      .on('close', this.onClose.bind(this))
      .loadFile(sourceFile);
  }

  isSame(window) {
    return window === this.window;
  }

  show() {
    this.window.show();
    this.window.webContents.send('show');

    return this;
  }

  hide() {
    this.window.hide();
    this.window.webContents.send('hide');

    return this;
  }

  toggleVisibility() {
    if (this.window.isVisible()) {
      this.hide();
    } else {
      this.show();
    }

    return this;
  }

  isVisible() {
    return this.window.isVisible();
  }

  onClose(event) {
    this.hide();

    event.preventDefault();
  }

  getWebContents() {
    return this.window.webContents;
  }

  getContentSize() {
    return this.window.getContentSize();
  }

  setContentSize(width, height) {
    if (typeof width !== 'number' || typeof height !== 'number') {
      console.warn('Window.setContentSize has been call with non-numeric arguments.');

      return this;
    }

    this.window.setContentSize(width, height, true);

    return this;
  }

  getPosition() {
    return this.window.getPosition();
  }

  setPosition(x, y, centerToX = true) {
    this.window.setPosition(
      centerToX ? Math.round(x - (this.window.getSize()[0] / 2)) : x,
      y,
    );

    return this;
  }
}

module.exports = Window;
