// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();

// eslint-disable-next-line import/no-extraneous-dependencies
const { notarize } = require('electron-notarize');
const { build } = require('../package.json');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir, packager } = context;

  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appBundleId = build.appId;
  const appPath = `${appOutDir}/${packager.appInfo.productFilename}.app`;
  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_ID_PASSWORD;

  await notarize({
    appBundleId,
    appPath,
    appleId,
    appleIdPassword,
  });
};
