/* global Fs, Electron */

const Marked = require('marked');
const YAML = require('js-yaml');
const Dedent = require('dedent');

class Translator {
    /**
     * Returns the currently set locale.
     *
     * @return {string}
     */
    static getLocale() {
        return `${this.language || 'en'}${this.country ? `-${this.country}` : ''}`;
    }

    /**
     * Sets the locale to use.
     *
     * @param {string} locale Locale to use for translating.
     * @return {Translator}
     */
    static setLocale(locale) {
        const dir = this.getLocalesPath();

        // Parse locale string
        const [language, country] = locale.toLowerCase().split('-');

        // Load default locale, which is english
        this.translations = YAML.safeLoad(
            Fs.readFileSync(`${dir}/${this.getLocale()}.yml`, 'utf8')
        );

        try {
            // Load language specific locale, if it isn’t the default one
            if (language !== 'en') {
                this.translations = Object.assign(
                    {},
                    this.translations,
                    YAML.safeLoad(
                        Fs.readFileSync(`${dir}/${language}.yml`, 'utf8')
                    )
                );
            }

            // Locale found. Set new language to requested one…
            this.language = language;
        } catch (e) {
            console.warn(Dedent`
                Couldn’t find locale file “${language}.yml” in locales \
                directory. Falling back to english.
            `);

            // Failed loading locale. Fall back to english…
            this.language = 'en';
        }

        // Couldn't load requested locale
        if (this.language !== language) {
            return this.parseForMarkdown();
        }

        try {
            // Try loading country specific locale
            this.translations = Object.assign(
                {},
                this.translations,
                YAML.safeLoad(
                    Fs.readFileSync(`${dir}/${language}-${country}.yml`, 'utf8')
                )
            );

            this.country = country;
        } catch (e) {
            console.warn(Dedent`
                Couldn’t find country specific locale file “${language}-\
                ${country}.yml” in locales directory. Using generic \
                “${language}.yml” now.
            `);

            // Reset any previously set country…
            this.country = null;
        }

        // Parse all strings for Markdown
        return this.parseForMarkdown();
    }

    /**
     * Parses all translations strings for Markdown markup and renders it.
     *
     * @return {Translator}
     */
    static parseForMarkdown() {
        // Going to use custom Marked renderer for parsing Markdown
        const renderer = new Marked.Renderer();

        // Parse markdown without enclosing p-tags
        renderer.paragraph = text => `${text}\n`;

        // Tell Marked to use custom renderer
        Marked.setOptions({ renderer });

        // Parse all translations strings
        Object
            .entries(this.translations)
            .forEach(
                ([key, value]) => (this.translations[key] = Marked(value))
            );

        return this;
    }

    /**
     * Returns the string according to the given key from the locale data.
     *
     * @param {string} key Key to string.
     * @return {string}
     */
    static getString(key) {
        return this.translations[key] || `#${key}#`;
    }

    /**
     * Returns the path of the directory where the locale files are stored.
     *
     * @return {string}
     */
    static getLocalesPath() {
        return this.localesPath;
    }

    /**
     * Sets the path of the directory where the locale files are stored.
     *
     * @param {string} path Path to the locales directory.
     * @return {Translator}
     */
    static setLocalesPath(path) {
        this.localesPath = path;

        return this;
    }
}

// Tell Translator where to find locales and use the system set locale
Translator
    .setLocalesPath(`${Electron.remote.app.getAppPath()}/locales`)
    .setLocale(Electron.remote.app.getLocale());
