const Electron = require('electron');

class About
{
    /**
    * Creates a About instance.
    *
    * @return {About}
    */
    constructor(app)
    {
        // Remember app instance
        this.app = app;

        // Return translation strings
        Electron.ipcMain.on('translate', (e, key) =>
            e.returnValue = this.app.translator.getString(key)
        );
    }

    /**
     * Shows the about window.
     */
    show()
    {
        // Create window instance
        this._window = new Electron.BrowserWindow({
            resizable: false,
            center: true,
            minimizable: false,
            maximizable: false,
            title: `${this.app.translator.getString('about')} ${Electron.app.getName()}`,
            show: false
        });

        // Load the contents
        this._window.loadURL(`file://${__dirname}/about.html`);

        // While loading the page, the ready-to-show event will be emitted when
        // renderer process has done drawing for the first time, showing window
        // after this event will have no visual flash
        this._window.once('ready-to-show', () => this._window.show());
    }

    /**
     * Provide static render function to execute logic in renderer process.
     */
    static render()
    {
        let nameNode = document.querySelector('[data-name]');
        let versionNode = document.querySelector('[data-version]');

        nameNode.textContent = Electron.remote.app.getName();
        versionNode.textContent = Electron.remote.app.getVersion();

        // Open links externally by default
        document.documentElement.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="http"]')) {
                e.preventDefault();
                Electron.shell.openExternal(e.target.href);
            }
        });

        // Get all labels which should be translated
        const labels = document.querySelectorAll('[data-locale-key]');

        // Translate all of them
        for (let label of labels) {
            let data = label.getAttribute('data-locale-key');
            let [key, target = 'textContent'] = data.split(':');
            let translation = Electron.ipcRenderer.sendSync('translate', key);

            label[target] = translation;
        }

        // Set window size
        Electron.remote.getCurrentWindow().setContentSize(
            document.body.offsetWidth,
            document.body.offsetHeight,
            false
        );
    }
}

module.exports = About;
