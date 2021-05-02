const { app } = require('electron');
const { resolve } = require('path');

const storagePath = app.getPath('userData');

module.exports = {
  integratedBackgroundsDirectory: resolve(__dirname, 'assets/backgrounds'),
  customBackgroundsDirectory: resolve(storagePath, 'Backgrounds'),
  logFile: resolve(storagePath, 'Output.log'),
  preferencesFile: resolve(storagePath, 'UserPreferences.json'),
};
