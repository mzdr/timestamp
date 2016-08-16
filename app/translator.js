class Translator
{
    /**
    * Creates a Translator instance.
    *
    * @param {string} locale Locale to use for translating.
    * @return {Translator}
    */
    constructor(locale)
    {
        // Load default locale, which is english
        this._strings = require('./locales/en.json');

        const [ language, country ] = locale.toLowerCase().split('-');

        try {

            // Try loading language specific locale, if it's not the default one
            if (language !== 'en') {
                this._strings = Object.assign(
                    {},
                    this._strings,
                    require(`./locales/${language}.json`)
                );
            }

            // Try loading country specific locale
            this._strings = Object.assign(
                {},
                this._strings,
                require(`./locales/${language}-${country}.json`)
            );

        } catch (e) {
            // Requested locale not found, or too specific
        }
    }

    /**
     * Returns the string according to the given key from the locale data.
     *
     * @param {string} key Key to string.
     * @return {string}
     */
    getString(key)
    {
        return this._strings[key] || `#${key}#`;
    }
}

module.exports = Translator;
