const Electron = require('electron'); // eslint-disable-line
const Moment = require('moment');

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
     */
    onTick(callback) {
        this.onTickHandler = callback;
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
