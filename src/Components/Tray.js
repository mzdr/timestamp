const Electron = require('electron');

class Tray
{
    /**
    * Creates a Tray instance.
    *
    * @return {Tray}
    */
    constructor()
    {
        // HACK: empty image as of image is required
        // @see https://github.com/electron/electron/issues/1553
        const icon = Electron.nativeImage.createEmpty();

        // The tray instance of Electron
        this._tray = new Electron.Tray(icon);

        // Build menu from template
        const contextMenu = Electron.Menu.buildFromTemplate(this.getMenuTemplate())

        // Fire click handler on a simple (left) click
        this._tray.on('click', () => (this._clickHandler || (() => {}))());

        // Bring up the context menu on a right click
        this._tray.on('right-click', () => this._tray.popUpContextMenu(contextMenu));
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
    * Returns the right click menu template.
    *
    * @return {object} Menu template.
    */
    getMenuTemplate()
    {
        return [
            {
                label: `About ${Electron.app.getName()}`,
                role: 'about'
            },
            {
                type: 'separator'
            },
            {
                label: 'Preferences…',
                accelerator: 'Command+,',
                click: () => (this._preferencesHandler || (() => {}))()
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click: () => (this._quitHandler || (() => {}))()
            }
        ];
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

    /**
     * Sets the handler for the quit menu item.
     *
     * @param {function} fn
     */
    onQuitClicked(fn)
    {
        this._quitHandler = fn;
    }

    /**
     * Sets the handler for the preferences menu item.
     *
     * @param {function} fn
     */
    onPreferencesClicked(fn)
    {
        this._preferencesHandler = fn;
    }
}

module.exports = Tray;
