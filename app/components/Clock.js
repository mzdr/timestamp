const datefns = require('date-fns');

class Clock {
  constructor(options = {}) {
    const { onTick, locale, format } = options;

    this.locale = locale.getObject();

    this
      .setFormat(format)
      .onTick();

    if (typeof onTick === 'function') {
      setInterval(() => onTick(this.onTick()), 1000);
      onTick(this.onTick());
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

  onTick() {
    this.now = new Date();

    return this;
  }

  toString() {
    const { locale } = this;

    try {
      return datefns.format(
        this.now,
        this.getFormat(),
        { locale },
      );
    } catch (e) {
      return '#invalid format#';
    }
  }
}

module.exports = Clock;
