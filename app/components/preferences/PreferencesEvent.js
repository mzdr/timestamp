class PreferencesEvent extends CustomEvent
{
    constructor(type, options = {})
    {
        const defaults = {
            bubbles: true
        };

        super(`preferences.${type}`, Object.assign({}, defaults, options));
    }

    static on(type, listener)
    {
        document.addEventListener(`preferences.${type}`, listener);
    }
}
