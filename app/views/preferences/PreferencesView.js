const { getAbsolutePath } = require('../../utils');
const Window = require('../../Window');

class PreferencesView {
  constructor({ locale }) {
    this.locale = locale.getObject();

    this.window = new Window({
      frame: true,
      sourceFile: getAbsolutePath('views', 'preferences', 'preferences.html'),
      webPreferences: {
        preload: getAbsolutePath('views', 'preferences', 'preload.js'),
      },
    });
  }
}

module.exports = PreferencesView;
