class ClockException
{
    /**
    * Creates an ClockException instance.
    *
    * @return {ClockException}
    */
    constructor(message)
    {
        this.name = 'ClockException';
        this.message = message;
    }
}

module.exports = ClockException;
