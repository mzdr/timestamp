const { Tray, nativeImage } = require('electron');

class SystemTray {
  constructor(options = {}) {
    this.tray = new Tray(
      nativeImage.createEmpty(),
    );

    if (typeof options.onClick === 'function') {
      this.tray.on('click', options.onClick);
    }
  }

  getBounds() {
    return this.tray.getBounds();
  }

  getLabel() {
    return this.label;
  }

  setLabel(label) {
    if (this.tray.isDestroyed()) {
      return this;
    }

    this.tray.setTitle(this.label = label, {
      fontType: 'monospacedDigit',
    });

    return this;
  }
}

module.exports = SystemTray;
