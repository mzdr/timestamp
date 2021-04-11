const locales = require('date-fns/locale');

class Locale {
  constructor({ preferred } = {}) {
    const [language, extension] = String(preferred).split('-');

    const fullSupport = `${language}${extension}`;
    const partialSupport = language;
    const fallback = 'en-US';

    this.locale = [fullSupport, partialSupport, fallback].find((k) => locales[k]);
    this.localeObject = locales[this.locale];
  }

  get() {
    return this.locale;
  }

  getObject() {
    return this.localeObject;
  }
}

module.exports = Locale;
