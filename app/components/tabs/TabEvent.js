class TabEvent extends CustomEvent
{
    constructor(type, options = {})
    {
        const defaults = {
            bubbles: true
        };

        super(`tabs.${type}`, Object.assign({}, defaults, options));
    }

    static on(type, listener)
    {
        document.addEventListener(`tabs.${type}`, listener);
    }
}
