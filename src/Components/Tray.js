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
        // const icon = './resources/icon.png';

        // The tray instance of Electron
        this._tray = new Electron.Tray(icon);

        // Build menu from template
        const contextMenu = Electron.Menu.buildFromTemplate(this.menuTemplate)

        // Hand over menu to tray
        // this._tray.setContextMenu(contextMenu);

        // Fire click handler on a simple (left) click
        this._tray.on('click', (e, bounds) => this.onClick(e, bounds));

        // Bring up the context menu on a right click
        this._tray.on('right-click', (event, bounds) => this._tray.popUpContextMenu(contextMenu));
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
    get menuTemplate()
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
                click: () => this.onPreferencesClicked()
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click: () => this.onQuitClicked()
            }
        ];
    }

    /**
     * Returns the current tray icon label.
     *
     * @return {string}
     */
    get label()
    {
        return this._label;
    }

    /**
     * Sets the tray icon label.
     *
     * @param {string} label
     */
    set label(label)
    {
        this._tray.setTitle(this._label = label);
    }

    /**
     * Returns the current set function which handles clicks on the tray icon.
     *
     * @return {function}
     */
    get onClick()
    {
        if (typeof this._clickHandler !== 'function') {
            this._clickHandler = () => {};
        }

        return this._clickHandler;
    }

    /**
     * Sets the function which handles clicks on the tray icon.
     *
     * @param {function} fn
     */
    set onClick(fn)
    {
        this._clickHandler = fn;
    }

    /**
     * Returns the current set handler for the quit menu item.
     *
     * @return {function}
     */
    get onQuitClicked()
    {
        if (typeof this._quitHandler !== 'function') {
            this._quitHandler = () => {};
        }

        return this._quitHandler;
    }

    /**
     * Sets the handler for the quit menu item.
     *
     * @param {function} fn
     */
    set onQuitClicked(fn)
    {
        this._quitHandler = fn;
    }

    /**
     * Returns the current set handler for the preferences menu item.
     *
     * @return {function}
     */
    get onPreferencesClicked()
    {
        if (typeof this._preferencesHandler !== 'function') {
            this._preferencesHandler = () => {};
        }

        return this._preferencesHandler;
    }

    /**
     * Sets the handler for the preferences menu item.
     *
     * @param {function} fn
     */
    set onPreferencesClicked(fn)
    {
        this._preferencesHandler = fn;
    }
}

module.exports = Tray;
