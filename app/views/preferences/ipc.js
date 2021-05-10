const { ipcRenderer } = require('electron');

const PREFERENCES_CHANGED = 'preferences.changed';
const PREFERENCES_GET = 'preferences.get';
const PREFERENCES_GET_ALL = 'preferences.getAll';
const PREFERENCES_GET_BACKGROUND_FILE_CONTENTS = 'preferences.get-background-file-contents';
const PREFERENCES_GET_BACKGROUNDS = 'preferences.get-backgrounds';
const PREFERENCES_HIDE = 'preferences.hide';
const PREFERENCES_SET = 'preferences.set';
const PREFERENCES_SHOW = 'preferences.show';

module.exports = {
  PREFERENCES_CHANGED,
  PREFERENCES_GET,
  PREFERENCES_GET_ALL,
  PREFERENCES_GET_BACKGROUND_FILE_CONTENTS,
  PREFERENCES_GET_BACKGROUNDS,
  PREFERENCES_HIDE,
  PREFERENCES_SET,
  PREFERENCES_SHOW,

  api: {
    get: (key) => ipcRenderer.invoke(PREFERENCES_GET, key),
    getAll: () => ipcRenderer.invoke(PREFERENCES_GET_ALL),
    getBackgroundFileContents: (payload) => ipcRenderer.invoke(PREFERENCES_GET_BACKGROUND_FILE_CONTENTS, payload),
    getBackgrounds: () => ipcRenderer.invoke(PREFERENCES_GET_BACKGROUNDS),
    hide: () => ipcRenderer.send(PREFERENCES_HIDE),
    on: (channel, fn) => ipcRenderer.on(`preferences.${channel}`, fn),
    set: (key, value) => ipcRenderer.send(PREFERENCES_SET, key, value),
    show: () => ipcRenderer.send(PREFERENCES_SHOW),
  },
};
