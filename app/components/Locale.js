/* eslint-disable global-require */
const locales = {
  date: require('date-fns/locale'),
  app: require('../locales'),
};

class Locale {
  constructor({ preferred } = {}) {
    const [language, extension] = String(preferred).split('-');

    console.log(`Preferred locale is “${preferred}”.`);

    const fullSupport = `${language}${extension}`;
    const partialSupport = language;
    const fallback = 'en-US';

    this.locale = [fullSupport, partialSupport, fallback].find((k) => locales.date[k]);
    this.localeObject = locales.date[this.locale];
    this.translations = locales.app[partialSupport] || locales.app.en;

    console.log(`Using “${this.translations.locale}” as application locale and “${this.locale}” as clock/calendar locale.`);
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
      .reduce((o, i) => o[i], this.translations) || key;
  }
}

module.exports = Locale;
