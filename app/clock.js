const Electron = require('electron');
const Moment = require('moment');

class Clock
{
    /**
    * Creates a Clock instance.
    *
    * @return {Clock}
    */
    constructor()
    {
        // Set locale for Moment.js
        Moment.locale(Electron.app.getLocale());

        // Default fallback format
        this.setFormat('HH:mm:ss');

        // Start the clock
        this.start();
    }

    /**
     * Starts the clock.
     */
    start()
    {
        if (typeof this._onTick !== 'function') {
            this._onTick = () => {};
        }

        this.intervalId = setInterval(
            () => this._onTick(this),
            1000
        );
    }

    /**
     * Stops the clock.
     */
    stop()
    {
        if (this.intervalId) {
            this.intervalId = clearInterval(this.intervalId);
        }
    }

    /**
     * Sets the callback function which will be called on each tick.
     *
     * @param {function} callback Tick function to call.
     */
    onTick(callback)
    {
        this._onTick = callback;
    }

    /**
     * Returns the currently set clock format.
     *
     * @return {string}
     */
    getFormat()
    {
        return this._format;
    }

    /**
     * Sets the clock format.
     *
     * @see http://momentjs.com/docs/#/displaying/format/
     * @param {string} format Clock format.
     */
    setFormat(format)
    {
        // Ignore jibberish
        if (typeof format !== 'string') {
            return;
        }

        this._format = format;
    }

    /**
     * Returns the status of the clock as a string in the currently set format.
     *
     * @return {string}
     */
    toString()
    {
        return Moment().format(this.getFormat());
    }
}

module.exports = Clock;
