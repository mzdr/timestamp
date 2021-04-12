const { Tray, nativeImage } = require('electron');

class SystemTray {
  constructor(options = {}) {
    const { onClick } = options;

    this.tray = new Tray(
      nativeImage.createEmpty(),
    );

    if (typeof onClick === 'function') {
      this.tray.on('click', onClick);
    }
  }

  getBounds() {
    return this.tray.getBounds();
  }

  getLabel() {
    return this.label;
  }

  setLabel(label) {
    const { tray } = this;

    if (tray.isDestroyed()) {
      return this;
    }

    tray.setTitle(this.label = label, {
      fontType: 'monospacedDigit',
    });

    return this;
  }
}

module.exports = SystemTray;
