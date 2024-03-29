const { ipcRenderer } = require('electron');
const { productName, version, copyright } = require('../package.json');

const APP_IS_PACKAGED = 'app.is-packaged';
const APP_QUIT = 'app.quit';
const APP_RESIZE_WINDOW = 'app.resize-window';
const APP_RESTART = 'app.restart';
const APP_TICK = 'app.tick';
const APP_TRANSLATE = 'app.translate';
const APP_UPDATE_DOWNLOADED = 'app.update-downloaded';

module.exports = {
  APP_IS_PACKAGED,
  APP_QUIT,
  APP_RESIZE_WINDOW,
  APP_RESTART,
  APP_TICK,
  APP_TRANSLATE,
  APP_UPDATE_DOWNLOADED,

  api: {
    productName,
    version,
    copyright,

    isPackaged: () => ipcRenderer.invoke(APP_IS_PACKAGED),
    on: (channel, fn) => ipcRenderer.on(`app.${channel}`, fn),
    quit: () => ipcRenderer.send(APP_QUIT),
    resizeWindow: (payload) => ipcRenderer.send(APP_RESIZE_WINDOW, payload),
    restart: () => ipcRenderer.send(APP_RESTART),
    translate: (key, options) => ipcRenderer.invoke(APP_TRANSLATE, key, options),
  },
};
