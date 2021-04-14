const { writeFile } = require('fs').promises;

class Logger {
  constructor(options = {}) {
    const { filePath } = options;

    this.filePath = filePath;
    this.levels = {
      emergency: 0,
      alert: 1,
      critical: 2,
      error: 3,
      warning: 4,
      notice: 5,
      informational: 6,
      debug: 7,
    };

    this.cleanUp = writeFile(this.filePath, `${'-'.repeat(60)}\n`);
  }

  async log(level, message) {
    const severity = Object.keys(this.levels).find((key) => this.levels[key] === level);
    const entry = `[${severity}]: ${message}`;

    await this.cleanUp;

    writeFile(this.filePath, `${entry}\n`, { flag: 'a' });
  }

  emergency(message) {
    return this.log(this.levels.emergency, message);
  }

  alert(message) {
    return this.log(this.levels.alert, message);
  }

  critical(message) {
    return this.log(this.levels.critical, message);
  }

  error(message) {
    return this.log(this.levels.error, message);
  }

  warning(message) {
    return this.log(this.levels.warning, message);
  }

  notice(message) {
    return this.log(this.levels.notice, message);
  }

  informational(message) {
    return this.log(this.levels.informational, message);
  }

  debug(message) {
    return this.log(this.levels.debug, message);
  }
}

module.exports = Logger;
