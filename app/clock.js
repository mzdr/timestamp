const Electron = require('electron'); // eslint-disable-line
const Moment = require('moment');
const ResetDateCache = require('reset-date-cache');

class Clock {
    /**
    * Creates a Clock instance.
    *
    * @return {Clock}
    */
    constructor() {
        // Set locale for Moment.js
        Moment.locale(Electron.app.getLocale());

        // Default fallback format
        this.setFormat('HH:mm:ss');

        // Start the clock
        this.start();

        // System timezone was changed during runtime…
        Electron.systemPreferences.subscribeNotification(
            'NSSystemTimeZoneDidChangeDistributedNotification',
            () => this.onTimeZoneChange()
        );
    }

    /**
     * Starts the clock.
     *
     * @return {Clock}
     */
    start() {
        if (typeof this.onTickHandler !== 'function') {
            this.onTickHandler = () => {};
        }

        this.intervalId = setInterval(
            () => this.onTickHandler(this),
            1000
        );

        return this;
    }

    /**
     * Stops the clock.
     *
     * @return {Clock}
     */
    stop() {
        if (this.intervalId) {
            this.intervalId = clearInterval(this.intervalId);
        }

        return this;
    }

    /**
     * Sets the callback function which will be called on each tick.
     *
     * @param {function} callback Tick function to call.
     * @return {Clock}
     */
    onTick(callback) {
        this.onTickHandler = callback;

        return this;
    }

    /**
     * System timezone was changed during runtime.
     *
     * @return {Clock}
     */
    onTimeZoneChange() {
        // Need to use a timeout since resetting the date cache right after the
        // system event has occured didn’t work properly/consistently.
        // Unfortunately I have no idea what’s the actual problem over here.
        setTimeout(() => {
            // Reset v8’s date cache…
            // @see https://github.com/nodejs/node/issues/4022
            // @see https://github.com/nodejs/node/issues/3449
            ResetDateCache();

            // Notifiy all webContents about the timezone change
            (Electron.webContents.getAllWebContents() || []).forEach(
                webContent => webContent.send('clock.timezone.changed')
            );
        }, 1000);

        return this;
    }

    /**
     * Returns the currently set clock format.
     *
     * @return {string}
     */
    getFormat() {
        return this.format;
    }

    /**
     * Sets the clock format.
     *
     * @see http://momentjs.com/docs/#/displaying/format/
     * @param {string} format Clock format.
     * @return {Clock}
     */
    setFormat(format) {
        // Ignore jibberish
        if (typeof format !== 'string') {
            return this;
        }

        this.format = format;

        return this;
    }

    /**
     * Returns the status of the clock as a string in the currently set format.
     *
     * @return {string}
     */
    toString() {
        return Moment().format(this.getFormat());
    }
}

module.exports = Clock;
