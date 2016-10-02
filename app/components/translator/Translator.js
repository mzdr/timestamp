const Marked = require('marked');

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
        this.translations = require('./locales/en.json');

        // Parse locale string
        const [language, country] = locale.toLowerCase().split('-');

        try {

            // Try loading language specific locale, if it's not the default one
            if (language !== 'en') {
                this.translations = Object.assign(
                    {},
                    this.translations,
                    require(`./locales/${language}.json`)
                );
            }

            // Try loading country specific locale
            this.translations = Object.assign(
                {},
                this.translations,
                require(`./locales/${language}-${country}.json`)
            );

        } catch (e) {
            // Requested locale not found, or too specific
        }

        // Parse all strings for Markdown
        this.parseForMarkdown();
    }

    /**
     * Parses all translations strings for Markdown markup and renders it.
     *
     * @return {Translator}
     */
    parseForMarkdown()
    {
        // Going to use custom Marked renderer for parsing Markdown
        const renderer = new Marked.Renderer() ;

        // Parse markdown without enclosing p-tags
        renderer.paragraph = (text) => `${text}\n`;

        // Tell Marked to use custom renderer
        Marked.setOptions({ renderer });

        // Parse all translations strings
        for (const key in this.translations) {
            if (this.translations.hasOwnProperty(key)) {
                this.translations[key] = Marked(this.translations[key]);
            }
        }

        return this;
    }

    /**
     * Returns the string according to the given key from the locale data.
     *
     * @param {string} key Key to string.
     * @return {string}
     */
    getString(key)
    {
        return this.translations[key] || `#${key}#`;
    }
}
