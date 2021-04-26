const { lt } = require('semver');
const { get } = require('https');
const { autoUpdater } = require('electron');

class Updater {
  constructor(options = {}) {
    const {
      checkEvery = 1000 * 60 * 60,
      currentVersion,
      feedUrl,
      logger,
      onUpdateDownloaded,
    } = options;

    this.feedUrl = feedUrl;
    this.logger = logger;

    autoUpdater.on('error', this.onError.bind(this));
    autoUpdater.on('update-downloaded', onUpdateDownloaded);

    setInterval(this.onTick.bind(this, currentVersion), checkEvery);

    this.logger.debug('Updater module created.');
    this.logger.debug(`Checking “${feedUrl}” every ${checkEvery / 1000} seconds for updates.`);
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

  quitAndInstall() {
    autoUpdater.quitAndInstall();

    return this;
  }

  async onTick(currentVersion) {
    const { warning, debug } = this.logger;

    try {
      const { version } = await this.fetchJson();

      if (lt(currentVersion, version) === false) {
        return;
      }

      autoUpdater.setFeedURL(this.feedUrl);
      autoUpdater.checkForUpdates();

      debug(`Update available. (${currentVersion} -> ${version})`);
    } catch ({ message }) {
      warning(message);
    }
  }

  onError({ message }) {
    this.logger.warning(message);
    return this;
  }
}

module.exports = Updater;
