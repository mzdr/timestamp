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
    return this.data.get(key);
  }

  set(key, data, persist = true) {
    this.data.set(key, data);
    this.onChange(key, data);

    if (persist) {
      this.save();
    }

    return this;
  }
}

module.exports = Preferences;
