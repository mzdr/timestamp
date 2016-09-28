class CalendarEvent extends CustomEvent
{
    constructor(type, options = {})
    {
        const defaults = {
            bubbles: true
        };

        super(`calendar.${type}`, Object.assign({}, defaults, options));
    }

    static on(type, listener)
    {
        document.addEventListener(`calendar.${type}`, listener);
    }
}
