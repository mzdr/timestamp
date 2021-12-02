/* eslint-disable global-require */
const locales = {
  date: require('date-fns/locale'),
  app: require('../locales'),
};

class Locale {
  constructor(options = {}) {
    const { preferred, logger } = options;
    const [language, extension] = String(preferred).split('-');

    logger.debug(`Preferred locale is “${preferred}”.`);

    const fullSupport = `${language}${extension}`;
    const partialSupport = language;
    const fallback = 'en-US';

    // Find locale that is supported by date-fns. Go from best to worst.
    this.locale = [fullSupport, partialSupport, fallback].find((k) => locales.date[k]);

    // Pick datefns locale object.
    this.localeObject = locales.date[this.locale];

    // Pick app translations. For now we just support language specific translations,
    // not regional specific ones. Might come at a later time.
    this.translations = locales.app[partialSupport] || locales.app.en;

    logger.debug(`Using “${this.translations.locale}” as application locale and “${this.locale}” as clock/calendar locale.`);
  }

  get() {
    return this.locale;
  }

  getObject() {
    return this.localeObject;
  }

  translate(key) {
    return key
      .split('.')
      .reduce((o, i) => (o || {})[i], this.translations) || key;
  }
}

module.exports = Locale;
