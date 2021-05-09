const { ipcMain } = require('electron');
const { resolve } = require('path');

const {
  readFile,
  writeFile,
  readdir,
  mkdir,
} = require('fs').promises;

const {
  preferencesFile,
  customBackgroundsDirectory,
  integratedBackgroundsDirectory,
} = require('../paths');

const Window = require('./Window');

const {
  PREFERENCES_GET,
  PREFERENCES_GET_ALL,
  PREFERENCES_GET_BACKGROUND_FILE_CONTENTS,
  PREFERENCES_GET_BACKGROUNDS,
  PREFERENCES_HIDE,
  PREFERENCES_SET,
  PREFERENCES_SHOW,

} = require('../views/preferences/ipc');

class Preferences {
  constructor(options = {}) {
    const {
      onChange,
      defaults,
      logger,
    } = options;

    this.logger = logger;
    this.filePath = preferencesFile;
    this.onChange = onChange || (() => {});
    this.data = new Map(Object.entries(defaults));

    ipcMain.handle(PREFERENCES_GET, (event, key) => this.get(key));
    ipcMain.handle(PREFERENCES_GET_ALL, () => this.getAll());
    ipcMain.handle(PREFERENCES_GET_BACKGROUND_FILE_CONTENTS, this.getBackgroundFileContents.bind(this));
    ipcMain.handle(PREFERENCES_GET_BACKGROUNDS, this.getBackgrounds.bind(this));

    ipcMain.on(PREFERENCES_SET, (event, key, value) => this.set(key, value));
    ipcMain.on(PREFERENCES_HIDE, () => this.window.hide());
    ipcMain.on(PREFERENCES_SHOW, () => this.window.show());

    this.window = new Window({
      name: 'preferences',
      titleBarStyle: 'hidden',
      transparent: true,
      vibrancy: 'sidebar',
      trafficLightPosition: { x: 20, y: 36 },
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

      await mkdir(customBackgroundsDirectory);
    } catch ({ message }) {
      if (/enoent/i.test(message)) {
        this.logger.debug('Looks like it’s the first time starting Timestamp. No user preferences found.');
      } else if (/eexist/i.test(message)) {
        this.logger.debug('Directory for custom backgrounds has already been created.');
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

  async getBackgroundFileContents(event, filePath) {
    try {
      return await readFile(filePath, { encoding: 'utf-8' });
    } catch ({ message }) {
      if (/enoent/i.test(message)) {
        this.logger.warning(`Couldn’t find background file “${filePath}”.`);
      } else {
        this.logger.error(message);
      }
    }

    return '';
  }

  async getBackgrounds() {
    const backgrounds = [];
    const directories = [integratedBackgroundsDirectory, customBackgroundsDirectory];

    await Promise.all(
      directories.map(async (directory) => {
        try {
          (await readdir(directory)).forEach(
            (background) => backgrounds.push(resolve(directory, background)),
          );
        } catch ({ message }) {
          this.logger.warn(message);
        }
      }),
    );

    return backgrounds;
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
