const { lt } = require('semver');
const { get } = require('https');
const { autoUpdater } = require('electron');

class Updater {
  constructor(options = {}) {
    const { feedUrl, checkEvery = 1000 * 60 * 60, currentVersion } = options;

    this.feedUrl = feedUrl;
    this.currentVersion = currentVersion;

    autoUpdater.on('error', this.onError.bind(this));
    autoUpdater.on('update-downloaded', this.onUpdateDownloaded.bind(this));

    setInterval(this.onTick.bind(this), checkEvery);

    console.log('Updater module created.');
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
    const { version } = await this.fetchJson();

    if (lt(this.currentVersion, version)) {
      autoUpdater.setFeedURL(this.feedUrl);
      autoUpdater.checkForUpdates();

      console.log(`Update available. (${this.currentVersion} -> ${version})`);
    }
  }

  onError() {
    return this;
  }

  onUpdateDownloaded() {
    console.log('Update downloaded and ready to install.');
    return this;
  }
}

module.exports = Updater;
