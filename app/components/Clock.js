const datefns = require('date-fns');

class Clock {
  constructor(options = {}) {
    const { onTick, locale, format } = options;

    this.locale = locale.getObject();
    this.setFormat(format);

    if (typeof onTick === 'function') {
      setInterval(() => onTick(this.toString()), 1000);
    }
  }

  getFormat() {
    return this.format;
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
    try {
      return datefns.format(new Date(), this.getFormat(), { locale: this.locale });
    } catch (e) {
      return '#invalid format#';
    }
  }
}

module.exports = Clock;
