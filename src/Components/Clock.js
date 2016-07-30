const Moment = require('moment');
const ClockException = require('./ClockException');

class Clock
{
    /**
    * Creates a Clock instance.
    *
    * @return {Clock}
    */
    constructor()
    {
        // default format
        this.format = 'HH:mm:ss';

        // start the clock
        this.start();
    }

    /**
     * Starts the clock.
     */
    start()
    {
        this.interval = setInterval(() => this.onTick(this), 1000);
    }

    /**
     * Stops the clock.
     */
    stop()
    {
        if (this.interval) {
            this.interval = clearInterval(this.interval);
        }
    }

    /**
     * Returns the currently set callback function which will be
     * called on each tick.
     *
     * @return {function}
     */
    get onTick()
    {
        if (typeof this._onTick !== 'function') {
            this._onTick = () => {};
        }

        return this._onTick;
    }

    /**
     * Sets the callback function which will be called on each tick.
     *
     * @param {function} fn Tick function to call.
     */
    set onTick(fn)
    {
        this._onTick = fn;
    }

    /**
     * Returns the currently set clock format.
     *
     * @return {string}
     */
    get format()
    {
        return this._format;
    }

    /**
     * Sets the clock format.
     *
     * @see http://momentjs.com/docs/#/displaying/format/
     * @param {string} format Clock format.
     */
    set format(format)
    {
        const type = typeof format;

        if (type !== 'string') {
            throw new ClockException(`Format needs to be of type "string", instead "${type}" was given.`);
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
        return Moment().format(this.format);
    }
}

module.exports = Clock;
