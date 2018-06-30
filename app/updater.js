const Semver = require('semver');
const Got = require('got');
const Electron = require('electron'); // eslint-disable-line

class Updater {
    /**
    * Creates an Updater instance.
    *
    * @return {Updater}
    */
    constructor() {
        this.lastRequestAt = null;
        this.lastResponse = null;
        this.url = 'https://mzdr.github.io/timestamp/update.json';
        this.cacheMaxTime = 1000 * 60 * 60; // 1 hour
    }

    /**
     * Tries to parse the response as a JSON.
     *
     * @param {Response} response The HTTP response.
     * @return {string}
     */
    static getJsonFromResponse(response) {
        if (response.statusCode !== 200) {
            throw { // eslint-disable-line
                message: `Request failed. (${response.statusCode})`
            };
        }

        try {
            return JSON.parse(response.body);
        } catch (error) {
            throw { // eslint-disable-line
                message: 'Unable to parse JSON.'
            };
        }
    }

    /**
     * Checks if the latest release is newer than the currently running app. If
     * it's true, the update url will be passed along.
     *
     * @param {object} release The latest release to compare against.
     * @return {string}
     */
    isNewerThanCurrentVersion(release) {
        const currentVersion = Electron.app.getVersion();

        if (Semver.lt(currentVersion, release.version) === false) {
            throw { // eslint-disable-line
                code: 0,
                message: 'No update available.'
            };
        }

        return {
            url: this.url,
            version: release.version
        };
    }

    /**
     * Checks the given update url if there are any updates. Returns a promise
     * which in turn resolves in an object containg a response code and message.
     *
     * A response code of -1 means there is an update available, 0 means we are
     * up to date and 1 means there is no update available or an error occured.
     *
     * @see http://electron.atom.io/docs/api/auto-updater/#autoupdatercheckforupdates
     * @return {Promise}
     */
    checkForUpdate() {
        return new Promise((resolve) => {
            const now = Date.now();

            // First time requesting
            if (this.lastRequestAt === null) {
                this.lastRequestAt = now;
            }

            // Resolve with cached response as request happened too short ago
            if (now - this.lastRequestAt < this.cacheMaxTime && this.lastResponse) {
                resolve(this.lastResponse);

                return;
            }

            Got
                .get(this.url)
                .then(response => this.constructor.getJsonFromResponse(response))
                .then(release => this.isNewerThanCurrentVersion(release))
                .then(release => this.constructor.runAutoUpdater(release))
                .then((status) => {
                    this.lastResponse = status;

                    return resolve(this.lastResponse);
                })

                // Resolve all errors with a default response code of 1
                .catch(({ message }) => {
                    this.lastResponse = { code: 1, message };

                    return resolve(this.lastResponse);
                });
        });
    }

    /**
     * Returns the response from the last update check.
     *
     * @return {object}
     */
    getLastResponse() {
        return this.lastResponse;
    }

    /**
     * Update checks have been successful and we are now firing up the auto
     * updating process.
     *
     * @param {string} url URL to the update.json file.
     * @param {string} version Version number of the upcoming update.
     * @see https://github.com/Squirrel/Squirrel.Mac#server-support
     */
    static runAutoUpdater({ url, version }) {
        return new Promise((success, fail) => {
            Electron.autoUpdater.setFeedURL(url);
            Electron.autoUpdater.checkForUpdates();
            Electron.autoUpdater.on('error', ({ message }) => fail({ message }));
            Electron.autoUpdater.on('update-downloaded', () => success({
                code: -1,
                message: 'Update downloaded.',
                version
            }));
        });
    }

    /**
     * Restarts the app and installs the update after it has been downloaded.
     *
     * @see http://electron.atom.io/docs/api/auto-updater/#autoupdaterquitandinstall
     */
    static quitAndInstall() {
        Electron.autoUpdater.quitAndInstall();
    }
}

module.exports = Updater;
