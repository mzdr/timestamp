const { Tray, nativeImage } = require('electron');

class SystemTray {
  constructor(options = {}) {
    const { onClick, logger } = options;

    this.logger = logger;
    this.tray = new Tray(
      nativeImage.createEmpty(),
    );

    this.logger.debug('System tray created.');

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
      this.logger.debug('Unable to set label since tray is destroyed.');

      return this;
    }

    tray.setTitle(this.label = label, {
      fontType: 'monospacedDigit',
    });

    return this;
  }
}

module.exports = SystemTray;
