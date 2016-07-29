const Electron = require('electron');

class App
{
    /**
     * Creates an App instance.
     *
     * @return {App}
     */
    constructor()
    {
        // This method will be called when Electron has finished
        // initialization and is ready to create browser windows.
        // Some APIs can only be used after this event occurs.
        Electron.app.on('ready', () => {
            new (require('./Controllers/Ready'))(this);
        })
    }
}

new App;
