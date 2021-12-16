const datefns = require('date-fns');

class Clock {
  #tickId = null;

  constructor(options = {}) {
    const { onTick, locale, format } = options;

    this.locale = locale.getObject();

    this
      .setFormat(format)
      .onTick(onTick);
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

  onTick(fn) {
    this.now = new Date();

    fn(this);

    if (this.#tickId === null) {
      this.#tickId = setInterval(() => this.onTick(fn), 1000);
    }
  }

  toString() {
    const { locale } = this;

    try {
      return datefns.format(
        this.now,
        this.getFormat(),
        { locale },
      );
    } catch (error) {
      return '#invalid format#';
    }
  }
}

module.exports = Clock;
