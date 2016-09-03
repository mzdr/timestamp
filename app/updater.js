const Semver = require('semver');
const Got = require('got');
const Electron = require('electron');

class Updater
{
    /**
    * Creates an Updater instance.
    *
    * @return {Updater}
    */
    constructor()
    {
        this.updateUrl = 'https://mzdr.github.io/timestamp/update.json';
    }

    /**
     * Tries to parse the response as a JSON.
     *
     * @param {Response} response The HTTP response.
     * @return {string}
     */
    getJsonFromResponse(response)
    {
        if (response.statusCode !== 200) {
            throw Error('Request failed.');
        }

        return JSON.parse(response.body);
    }

    /**
     * Checks if the latest release is newer than the currently running app. If
     * it's true, the update url will be passed along.
     *
     * @param {object} release The latest release to compare against.
     * @return {string}
     */
    isNewerThanCurrentVersion(release)
    {
        let currentVersion = Electron.app.getVersion();

        if (Semver.lt(currentVersion, release.version) === false) {
            throw Error('We are up to date.');
        }

        return this.updateUrl;
    }

    /**
     * Checks the GitHub repository if there are any updates.
     *
     * @see http://electron.atom.io/docs/api/auto-updater/#autoupdatercheckforupdates
     * @return {Promise}
     */
    checkForUpdate()
    {
        return new Promise((updateAvailable, updateNotAvailable) => {
            Got
                .get(this.updateUrl)
                .then((response) => this.getJsonFromResponse(response))
                .then((release) => this.isNewerThanCurrentVersion(release))
                .then((url) => this.runAutoUpdater(
                    url,
                    updateAvailable,
                    updateNotAvailable
                ))
                .catch(updateNotAvailable);
        });
    }

    /**
     * Update checks have been successful and we are now firing up the auto
     * updating process.
     *
     * @param {string} url URL to the update.json file
     * @param {function} updateAvailable Function to approve available update
     * @param {function} updateNotAvailable Function to deny avaiable update
     * @see https://github.com/Squirrel/Squirrel.Mac#server-support
     */
    runAutoUpdater(url, updateAvailable, updateNotAvailable)
    {
        Electron.autoUpdater.setFeedURL(url);
        Electron.autoUpdater.checkForUpdates();
        Electron.autoUpdater.on('update-available', updateAvailable);
        Electron.autoUpdater.on('update-not-available', updateNotAvailable);
        Electron.autoUpdater.on('error', updateNotAvailable);
    }

    /**
     * Checks if the update has been downloaded.
     *
     * @return {Promise}
     */
    onUpdateDownloaded()
    {
        return new Promise((updateDownloaded, updateNotDownloaded) => {
            Electron.autoUpdater.on('error', updateNotDownloaded);
            Electron.autoUpdater.on('update-downloaded', updateDownloaded);
        });
    }

    /**
     * Restarts the app and installs the update after it has been downloaded.
     *
     * @see http://electron.atom.io/docs/api/auto-updater/#autoupdaterquitandinstall
     */
    quitAndInstall()
    {
        Electron.autoUpdater.quitAndInstall();
    }
}

module.exports = Updater;
