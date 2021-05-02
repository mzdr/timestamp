const { ipcMain } = require('electron');
const { readFile, writeFile } = require('fs').promises;
const { join, resolve } = require('path');

const Window = require('./Window');

const {
  PREFERENCES_GET,
  PREFERENCES_GET_ALL,
  PREFERENCES_HIDE,
  PREFERENCES_SET,
  PREFERENCES_SHOW,
} = require('../views/preferences/ipc');

class Preferences {
  constructor(options = {}) {
    const {
      onChange,
      storagePath,
      defaults,
      logger,
    } = options;

    this.logger = logger;
    this.filePath = join(storagePath, 'UserPreferences.json');
    this.onChange = onChange || (() => {});
    this.data = new Map(Object.entries(defaults));

    this.logger.debug(`Using those default values as preferences: “${JSON.stringify(defaults)}”.`);

    ipcMain.handle(PREFERENCES_GET, (event, key) => this.get(key));
    ipcMain.handle(PREFERENCES_GET_ALL, () => this.getAll());
    ipcMain.on(PREFERENCES_SET, (event, key, value) => this.set(key, value));
    ipcMain.on(PREFERENCES_HIDE, () => this.window.hide());
    ipcMain.on(PREFERENCES_SHOW, () => this.window.show());

    this.window = new Window({
      name: 'preferences',
      frame: true,
      sourceFile: resolve(__dirname, '../views/preferences/preferences.html'),
      webPreferences: {
        preload: resolve(__dirname, '../views/preferences/preload.js'),
      },
    });

    this.logger.debug('Preferences module created.');

    this.load();
  }

  async load() {
    try {
      this.logger.debug(`Trying to load user preferences from “${this.filePath}”.`);

      Object
        .entries(JSON.parse(await readFile(this.filePath, 'utf8')))
        .forEach((item) => this.set(...item, false));
    } catch ({ message }) {
      if (/enoent/i.test(message)) {
        this.logger.debug('Looks like it’s the first time starting Timestamp. No user preferences found.');
      } else {
        this.logger.error(message);
      }
    }

    return this;
  }

  async save() {
    await writeFile(this.filePath, JSON.stringify(Object.fromEntries(this.data)));

    return this;
  }

  getAll() {
    return new Map(this.data);
  }

  get(key) {
    this.logger.debug(`Getting value of preference with key ”${key}”.`);

    return this.data.get(key);
  }

  set(key, value, persist = true) {
    this.logger.debug(`Setting value for preference with key ”${key}” to “${value}”.`);

    this.data.set(key, value);
    this.onChange(key, value);

    if (persist) {
      this.save();
    }

    return this;
  }
}

module.exports = Preferences;
