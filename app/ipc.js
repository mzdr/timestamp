const { ipcRenderer } = require('electron');

const APP_QUIT = 'app.quit';
const APP_RESIZE_WINDOW = 'app.resizeWindow';
const APP_RESTART = 'app.restart';
const APP_TRANSLATE = 'app.translate';
const APP_UPDATE_DOWNLOADED = 'app.update-downloaded';

module.exports = {
  APP_QUIT,
  APP_RESIZE_WINDOW,
  APP_RESTART,
  APP_TRANSLATE,
  APP_UPDATE_DOWNLOADED,

  api: {
    quit: () => ipcRenderer.send(APP_QUIT),
    resizeWindow: (payload) => ipcRenderer.send(APP_RESIZE_WINDOW, payload),
    restart: () => ipcRenderer.send(APP_RESTART),
    translate: (key, options) => ipcRenderer.invoke(APP_TRANSLATE, key, options),
  },
};
