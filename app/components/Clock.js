const { format } = require('date-fns');

class Clock {
  constructor(options = {}) {
    const { onTick, locale } = options;

    this.locale = locale.getObject();

    if (typeof onTick === 'function') {
      setInterval(() => onTick(this.toString()), 1000);
    }
  }

  getFormat() {
    return this.format || 'Pp';
  }

  setFormat(value) {
    if (typeof value !== 'string') {
      throw new Error(`Clock.format is supposed to be a string, ${typeof value} given.`);
    }

    // @see https://date-fns.org/docs/format
    this.format = value;

    return this;
  }

  toString() {
    return format(new Date(), this.getFormat(), { locale: this.locale });
  }
}

module.exports = Clock;
