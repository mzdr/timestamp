const { ipcMain } = require('electron');
const { readFile, writeFile } = require('fs').promises;

const { getAbsolutePath } = require('../utils');
const Window = require('./Window');

class Preferences {
  constructor(options = {}) {
    const {
      onChange,
      storagePath,
      defaults,
      logger,
    } = options;

    this.logger = logger;
    this.storagePath = storagePath;
    this.onChange = onChange || (() => {});
    this.data = new Map(Object.entries(defaults));

    this.logger.debug(`Using those default values as preferences: “${JSON.stringify(defaults)}”.`);

    ipcMain.handle('get', (event, key) => this.get(key));
    ipcMain.on('set', (event, key, value) => this.set(key, value));

    this.window = new Window({
      frame: true,
      sourceFile: getAbsolutePath('views', 'preferences', 'preferences.html'),
      webPreferences: {
        preload: getAbsolutePath('views', 'preferences', 'preload.js'),
      },
    });

    this.logger.debug('Preferences module created.');

    this.load();
  }

  async load() {
    try {
      this.logger.debug(`Trying to load user preferences from “${this.storagePath}”.`);

      Object
        .entries(JSON.parse(await readFile(this.storagePath, 'utf8')))
        .forEach((item) => this.set(...item, false));
    } catch ({ message }) {
      if (/enoent/i.test(message)) {
        this.logger.debug('Looks like it’s the first time starting Timestamp. No user preferences found.');
      } else {
        this.logger.debug(`Unknown error: ${message}`);
      }
    }

    return this;
  }

  async save() {
    await writeFile(this.storagePath, JSON.stringify(Object.fromEntries(this.data)));

    return this;
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
