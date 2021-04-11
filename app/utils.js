const { join } = require('path');

module.exports = {
  getAbsolutePath(...path) {
    return join(__dirname, ...path.filter(Boolean));
  },
};
