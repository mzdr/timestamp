const { app } = require('electron');
const { format } = require('date-fns');
const locales = require('date-fns/locale');

class Clock {
  constructor(options = {}) {
    const { onTick } = options;
    const [locale, extension] = app.getLocale().split('-');

    this.locale = locales[`${locale}${extension}`] || locales[locale] || locales.en;

    if (typeof onTick === 'function') {
      setInterval(() => onTick(this.toString()), 1000);
    }

    return this;
  }

  getFormat() {
    return this.format || 'Pp';
  }

  setFormat(value) {
    if (typeof value !== 'string') {
      throw new Error(`Clock.format is supposed to be a string, ${typeof value} given.`);
    }

    // @see https://date-fns.org/v2.20.1/docs/format
    this.format = value;

    return this;
  }

  toString() {
    return format(new Date(), this.getFormat(), { locale: this.locale });
  }
}

module.exports = Clock;
