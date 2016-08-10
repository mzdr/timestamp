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
        // Going to use GitHub API to check for latest release
        this.releasesUrl = 'https://api.github.com/repos/mzdr/timestamp/releases';
    }

    /**
     * Tries to parse the response as a JSON.
     *
     * @param {Response} response The HTTP response.
     * @return {Promise|string}
     */
    getJsonFromResponse(response)
    {
        if (response.statusCode === 200) {
            try {
                return JSON.parse(response.body);
            } catch (e) {
                return Promise.reject('Failed to parse response.');
            }
        }

        return Promise.reject('Request failed.');
    }

    /**
     * Tries to get the latest release from the JSON object. On failure a
     * rejected promise will be returned.
     *
     * @param {object} json
     * @return {Promise|object}
     */
    getLatestReleaseFromJson(json)
    {
        let latestRelease = json[0];

        if (typeof latestRelease !== 'object') {
            return Promise.reject('Parsed response has invalid data.');
        }

        return latestRelease;
    }

    /**
     * Checks if the latest release is newer than the currently running app. If
     * it's true the release object will be passed along, otherwise a rejected
     * promise will returned.
     *
     * @param {object} release The latest release to compare against.
     * @return {Promise|object}
     */
    isNewerThanCurrentVersion(release)
    {
        let currentVersion = Electron.app.getVersion();

        if (Semver.lt(currentVersion, release.tag_name) === false) {
            return Promise.reject('We are up to date.');
        }

        return release;
    }

    /**
     * Tries to extract the download link from the release object.
     *
     * @param {object} release Release data.
     * @return {Promise|string}
     */
    getDownloadLink(release) {
        try {
            return release.assets[0].browser_download_url;
        } catch (e) {
            return Promise.reject('Unable to get download link for latest release.');
        }
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

            Got.get(this.releasesUrl)
                .then(this.getJsonFromResponse)
                .then(this.getLatestReleaseFromJson)
                .then(this.isNewerThanCurrentVersion)
                .then(this.getDownloadLink)
                .then((downloadLink) => {
                    Electron.autoUpdater.setFeedURL(downloadLink);
                    Electron.autoUpdater.checkForUpdates();
                    Electron.autoUpdater.on('update-available', updateAvailable);
                    Electron.autoUpdater.on('update-not-available', updateNotAvailable);
                    Electron.autoUpdater.on('error', updateNotAvailable);
                })
                .catch(updateNotAvailable);
        });
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
