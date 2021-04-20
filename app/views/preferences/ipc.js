const { ipcRenderer } = require('electron');

const PREFERENCES_GET = 'preferences.get';
const PREFERENCES_SET = 'preferences.set';
const PREFERENCES_SHOW = 'preferences.show';

module.exports = {
  PREFERENCES_GET,
  PREFERENCES_SET,
  PREFERENCES_SHOW,

  api: {
    get: (key) => ipcRenderer.invoke(PREFERENCES_GET, key),
    on: (channel, fn) => ipcRenderer.on(channel, fn),
    set: (key, value) => ipcRenderer.send(PREFERENCES_SET, key, value),
    show: () => ipcRenderer.send(PREFERENCES_SHOW),
  },
};
