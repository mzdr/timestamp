const { lt } = require('semver');
const { get } = require('https');
const { autoUpdater } = require('electron');

class Updater {
  constructor(options = {}) {
    const {
      feedUrl,
      checkEvery = 1000 * 60 * 60,
      currentVersion,
      logger,
    } = options;

    this.feedUrl = feedUrl;
    this.currentVersion = currentVersion;
    this.logger = logger;

    autoUpdater.on('error', this.onError.bind(this));
    autoUpdater.on('update-downloaded', this.onUpdateDownloaded.bind(this));

    setInterval(this.onTick.bind(this), checkEvery);

    this.logger.debug('Updater module created.');
  }

  async fetchJson() {
    return new Promise((resolve, reject) => {
      const request = get(this.feedUrl, (response) => {
        const { statusCode } = response;
        const json = [];

        if (statusCode !== 200) {
          reject(response);
        } else {
          response.on('data', json.push.bind(json));
          response.on('end', () => resolve(JSON.parse(json.join())));
        }
      });

      request.on('error', reject);
    });
  }

  async onTick() {
    const { warning, debug } = this.logger;

    try {
      const { version } = await this.fetchJson();

      if (lt(this.currentVersion, version)) {
        autoUpdater.setFeedURL(this.feedUrl);
        autoUpdater.checkForUpdates();

        debug(`Update available. (${this.currentVersion} -> ${version})`);
      }
    } catch (e) {
      warning(e.message);
    }
  }

  onError() {
    return this;
  }

  onUpdateDownloaded() {
    this.logger.debug('Update downloaded and ready to install.');
    return this;
  }
}

module.exports = Updater;
