const { ipcMain } = require('electron');
const { readFile, writeFile } = require('fs').promises;

const { getAbsolutePath } = require('../utils');
const Window = require('./Window');

class Preferences {
  constructor(options = {}) {
    const { onChange, storagePath, defaults } = options;

    console.log(`Using those default values as preferences: “${JSON.stringify(defaults)}”.`);

    this.storagePath = storagePath;
    this.onChange = onChange || (() => {});
    this.data = new Map(Object.entries(defaults));

    ipcMain.handle('get', (event, key) => this.get(key));
    ipcMain.on('set', (event, key, value) => this.set(key, value));

    this.window = new Window({
      frame: true,
      sourceFile: getAbsolutePath('views', 'preferences', 'preferences.html'),
      webPreferences: {
        preload: getAbsolutePath('views', 'preferences', 'preload.js'),
      },
    });

    console.log('Preferences module created.');

    this.load();
  }

  async load() {
    try {
      console.log(`Trying to load user preferences from “${this.storagePath}”.`);

      Object
        .entries(JSON.parse(await readFile(this.storagePath, 'utf8')))
        .forEach((item) => this.set(...item, false));
    } catch ({ message }) {
      if (/enoent/i.test(message)) {
        console.log('Looks like it’s the first time starting Timestamp. No user preferences found.');
      } else {
        console.log(`Unknown error: ${message}`);
      }
    }

    return this;
  }

  async save() {
    await writeFile(this.storagePath, JSON.stringify(Object.fromEntries(this.data)));

    return this;
  }

  get(key) {
    console.log(`Getting value of preference with key ”${key}”.`);

    return this.data.get(key);
  }

  set(key, value, persist = true) {
    console.log(`Setting value for preference with key ”${key}” to “${value}”.`);

    this.data.set(key, value);
    this.onChange(key, value);

    if (persist) {
      this.save();
    }

    return this;
  }
}

module.exports = Preferences;
