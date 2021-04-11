const { ipcMain } = require('electron');

const { getAbsolutePath } = require('../../utils');
const Window = require('../../Window');

class PreferencesView {
  constructor({ locale }) {
    this.locale = locale.getObject();

    ipcMain.on('resizeWindow', this.onResizeWindow.bind(this));

    this.window = new Window({
      frame: true,
      sourceFile: getAbsolutePath('views', 'preferences', 'preferences.html'),
      webPreferences: {
        preload: getAbsolutePath('views', 'preferences', 'preload.js'),
      },
    });
  }

  onResizeWindow(event, { width, height }) {
    this.window.setSize(width, height);
  }
}

module.exports = PreferencesView;
