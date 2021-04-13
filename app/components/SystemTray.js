const { Tray, nativeImage } = require('electron');

class SystemTray {
  constructor(options = {}) {
    const { onClick } = options;

    this.tray = new Tray(
      nativeImage.createEmpty(),
    );

    console.log('System tray created.');

    if (typeof onClick === 'function') {
      this.tray.on('click', onClick);
    }
  }

  getBounds() {
    return this.tray.getBounds();
  }

  getLabel() {
    return this.tray.getTitle();
  }

  setLabel(label) {
    const { tray } = this;

    if (tray.isDestroyed()) {
      console.log('Unable to set label since tray is destroyed.');

      return this;
    }

    tray.setTitle(this.label = label, {
      fontType: 'monospacedDigit',
    });

    return this;
  }
}

module.exports = SystemTray;
