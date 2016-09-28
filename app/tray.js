const Electron = require('electron');

class Tray
{
    /**
    * Creates a Tray instance.
    *
    * @return {Tray}
    */
    constructor(app)
    {
        // Remember app instance
        this.app = app;

        // HACK: empty image as of image is required
        // @see https://github.com/electron/electron/issues/1553
        const icon = Electron.nativeImage.createEmpty();

        // The tray instance of Electron
        this._tray = new Electron.Tray(icon);

        // Fire click handler on a simple (left) click
        this._tray.on('click', () => (this._clickHandler || (() => {}))());
    }

    /**
     * Returns the bounds of this tray icon as Object.
     *
     * @see http://electron.atom.io/docs/api/tray/#traygetbounds-macos-windows
     * @return {object}
     */
    getBounds()
    {
        return this._tray.getBounds();
    }

    /**
     * Returns the current tray icon label.
     *
     * @return {string}
     */
    getLabel()
    {
        return this._label;
    }

    /**
     * Sets the tray icon label.
     *
     * @param {string} label
     */
    setLabel(label)
    {
        this._tray.setTitle(this._label = label);
    }

    /**
     * Sets the function which handles clicks on the tray icon.
     *
     * @param {function} fn
     */
    onClick(fn)
    {
        this._clickHandler = fn;
    }
}

module.exports = Tray;
