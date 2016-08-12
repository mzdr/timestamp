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

        // Fire click handler on a simple (left) click
        this._tray.on('click', () => (this._clickHandler || (() => {}))());

        // Build right click menu
        this.buildMenu(this.getMenuTemplate());

        // Bring up the context menu on a right click
        this._tray.on('right-click', () => this._tray.popUpContextMenu(
            this.getMenu()
        ));
    }

    /**
     * Create the right click menu.
     *
     * @param {object} template The menu template.
     * @return {Menu}
     */
    buildMenu(template)
    {
        this._contextMenu = new Electron.Menu();
        this._menuItems = {};

        template.forEach((item) => {
            let menuItem = new Electron.MenuItem(item);

            this._contextMenu.append(menuItem);

            // Save menu item under given id for later access
            if (item.id) {
                this._menuItems[item.id] = menuItem;
            }
        });

        return this._contextMenu;
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
     * Returns the context menu for this tray.
     *
     * @return {Menu}
     */
    getMenu()
    {
        // Menu has not yet been built
        if (this._contextMenu === undefined) {
            return new Electron.Menu();
        }

        return this._contextMenu;
    }

    /**
     * Returns a specific menu item from the current menu.
     *
     * @param {string} id Menu item id.
     * @return {MenuItem}
     */
    getMenuItem(id)
    {
        return this._menuItems[id];
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
                label: `Version ${Electron.app.getVersion()}`,
                enabled: false
            },
            {
                id: 'checkForUpdate',
                label: 'Check for update',
                click: (menuItem) => (
                    this._checkForUpdateHandler || (() => {})
                )(menuItem)
            },
            {
                id: 'youAreUpToDate',
                label: 'You are up to date!',
                enabled: false,
                visible: false
            },
            {
                id: 'downloadingUpdate',
                label: 'Downloading update…',
                enabled: false,
                visible: false
            },
            {
                id: 'downloadingUpdateFailed',
                label: 'Downloading update failed',
                enabled: false,
                visible: false
            },
            {
                id: 'restartAndInstallUpdate',
                label: 'Restart and install update',
                visible: false,
                click: (menuItem) => (
                    this._restartAndInstallUpdateHandler || (() => {})
                )(menuItem)
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

    /**
     * Sets the handler for the check for update menu item.
     *
     * @param {function} fn
     */
    onCheckForUpdateClicked(fn)
    {
        this._checkForUpdateHandler = fn;
    }

    /**
     * Sets the handler for the restart and install update menu item.
     *
     * @param {function} fn
     */
    onRestartAndInstallUpdate(fn)
    {
        this._restartAndInstallUpdateHandler = fn;
    }
}

module.exports = Tray;
