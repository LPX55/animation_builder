require('dotenv').config({ silent: true });
const path = require('path');
const paths = require('./../configs/paths');

const getSettings = () => {
  const packageJSONPath = path.join(paths.appPath, 'package.json');
  const packageJSON = require(packageJSONPath);
  const VERSION = packageJSON.version.split('-')[0]; // because ae doesnt load extensions that arent in the exact format '1.0.0'
  const certificatePath = path.resolve(paths.appPath, `configs/${process.env.CERTIFICATE_FILENAME}`);

  return {
    NAME: process.env.NAME || 'My CEP Extension',
    VERSION: VERSION || '1.0.0',
    BUNDLE_ID: process.env.BUNDLE_ID || 'my.cep.extension',
    BUNDLE_VERSION: process.env.BUNDLE_VERSION || VERSION || '1.0.0',
    CEP_VERSION: process.env.CEP_VERSION || '',
    PANEL_WIDTH: process.env.PANEL_WIDTH || '500',
    PANEL_HEIGHT: process.env.PANEL_HEIGHT || '500',
    CEF_PARAMS: process.env.CEF_PARAMS || '',
    AUTO_OPEN_REMOTE_DEBUGGER: process.env.AUTO_OPEN_REMOTE_DEBUGGER || '',
    ENABLE_PLAYERDEBUGMODE: process.env.ENABLE_PLAYERDEBUGMODE || '',
    TAIL_LOGS: process.env.TAIL_LOGS || '',
    HOSTS:
      process.env.HOSTS ||
      'PHXS, PHSP, IDSN, AICY, ILST, PPRO, AEFT, PRLD, FLPR, DRWV',
    CERTIFICATE_PASSWORD:
      process.env.CERTIFICATE_PASSWORD || 'certificate-password',
    CERTIFICATE_FILENAME: certificatePath,
    CERTIFICATE_TIMESTAMP: process.env.CERTIFICATE_TIMESTAMP || '',
    CERTIFICATE_COUNTRY: process.env.CERTIFICATE_COUNTRY || 'US',
    CERTIFICATE_PROVINCE: process.env.CERTIFICATE_PROVINCE || 'CA',
    CERTIFICATE_ORG: process.env.CERTIFICATE_ORG || 'org',
    CERTIFICATE_NAME: process.env.CERTIFICATE_NAME || 'name',
    ICON_NORMAL: process.env.ICON_NORMAL || '',
    ICON_ROLLOVER: process.env.ICON_ROLLOVER || '',
    ICON_DARK_NORMAL: process.env.ICON_DARK_NORMAL || '',
    ICON_DARK_ROLLOVER: process.env.ICON_DARK_ROLLOVER || '',
    
  };
}

module.exports = {getSettings};
