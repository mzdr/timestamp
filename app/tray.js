const Electron = require('electron'); // eslint-disable-line

class Tray {
    /**
    * Creates a Tray instance.
    *
    * @return {Tray}
    */
    constructor() {
        // HACK: empty image as of image is required
        // @see https://github.com/electron/electron/issues/1553
        const icon = Electron.nativeImage.createEmpty();

        // The tray instance of Electron
        this.tray = new Electron.Tray(icon);

        // Fire click handler on a simple (left) click
        this.tray.on('click', () => (this.clickHandler || (() => {}))());
    }

    /**
     * Returns the bounds of this tray icon as Object.
     *
     * @see http://electron.atom.io/docs/api/tray/#traygetbounds-macos-windows
     * @return {object}
     */
    getBounds() {
        return this.tray.getBounds();
    }

    /**
     * Returns the current tray icon label.
     *
     * @return {string}
     */
    getLabel() {
        return this.label;
    }

    /**
     * Sets the tray icon label.
     *
     * @param {string} label
     */
    setLabel(label) {
        if (this.tray.isDestroyed()) {
            return this;
        }

        this.tray.setTitle(this.label = label);

        return this;
    }

    /**
     * Sets the function which handles clicks on the tray icon.
     *
     * @param {function} fn
     */
    onClick(fn) {
        this.clickHandler = fn;
    }
}

module.exports = Tray;
