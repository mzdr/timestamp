const Electron = require('electron');
const App = require('./app');

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
Electron.app.on('ready', () => new App);
