class AboutEvent extends CustomEvent
{
    constructor(type, options = {})
    {
        const defaults = {
            bubbles: true
        };

        super(`about.${type}`, Object.assign({}, defaults, options));
    }

    static on(type, listener)
    {
        document.addEventListener(`about.${type}`, listener);
    }
}
