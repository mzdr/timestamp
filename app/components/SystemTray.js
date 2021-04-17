const { Tray, nativeImage } = require('electron');

class SystemTray {
  constructor(options = {}) {
    const { onClick, logger } = options;

    this.logger = logger;
    this.prefix = '';
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

  getPrefix() {
    return this.prefix;
  }

  setPrefix(value) {
    this.prefix = value;

    return this;
  }

  getLabel() {
    return this.tray.getTitle();
  }

  setLabel(label) {
    const { tray } = this;

    if (tray.isDestroyed()) {
      this.logger.error('Unable to set label since tray is destroyed.');

      return this;
    }

    tray.setTitle(`${this.getPrefix()}${this.label = label}`, {
      fontType: 'monospacedDigit',
    });

    return this;
  }
}

module.exports = SystemTray;
