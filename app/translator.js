const Electron = require('electron');
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
        this._strings = require('./locales/en.json');

        // Parse locale string
        const [language, country] = locale.toLowerCase().split('-');

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

        // Parse all strings for Markdown
        this.parseForMarkdown();

        // Return translation strings to renderer
        Electron.ipcMain.on('translator.get', (e, key) =>
            e.sender.send('translator.get', key, this.getString(key))
        );
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
        for (let key in this._strings) {
            if (this._strings.hasOwnProperty(key)) {
                this._strings[key] = Marked(this._strings[key]);
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
        return this._strings[key] || `#${key}#`;
    }
}

module.exports = Translator;
