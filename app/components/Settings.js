const { readFile, writeFile } = require('fs').promises;

class Settings {
  constructor(options = {}) {
    const { onChange, storagePath, defaults } = options;

    console.log(`Creating settings module with those defaults: “${JSON.stringify(defaults)}”.`);

    this.storagePath = storagePath;
    this.onChange = onChange || (() => {});
    this.data = new Map(Object.entries(defaults));
  }

  async load() {
    try {
      console.log(`Trying to load user settings from “${this.storagePath}”.`);

      Object
        .entries(JSON.parse(await readFile(this.storagePath, 'utf8')))
        .forEach((setting) => this.set(...setting, false));
    } catch ({ message }) {
      if (/enoent/i.test(message)) {
        console.log('Looks like it’s the first time starting Timestamp. No user settings found.');
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

module.exports = Settings;
