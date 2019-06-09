process.env.NODE_ENV = 'production';
require('dotenv').config({ silent: true });
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const paths = require('./../configs/paths');
const zxp = require('zxp-sign-cmd');
const { execSync } = require('child_process');
const manifestTemplate = require('./../configs/templates/manifest');
const cep = require('./cep');

function fixZXPPermissions() {
  return new Promise((resolve, reject) => {
    if (process.platform !== 'win32') {
      execSync(`chmod +x ${require('zxp-provider').osx}`);
    }
    resolve();
  });
}

function getOutputFilename() {
  const { NAME, VERSION } = cep.getSettings();

  return `${NAME}-${VERSION}.zxp`.replace(/ /g, '-');
}

function getOutputPath(fileName) {
  return path.join(paths.appArchive, fileName);
}

function sign() {
  const { CERTIFICATE_PASSWORD, CERTIFICATE_FILENAME, CERTIFICATE_TIMESTAMP } = cep.getSettings();

  const filename = getOutputFilename();
  const outputPath = getOutputPath(filename);

  return new Promise((resolve, reject) => {
    zxp.sign(
      {
        input: paths.appBuild,
        output: outputPath,
        cert: CERTIFICATE_FILENAME,
        password: CERTIFICATE_PASSWORD,
        timestamp: CERTIFICATE_TIMESTAMP,
      },
      (error, result) => {
        if (error) reject(error);
        else {
          resolve({
            result,
            filename,
            outputPath,
          });
        }
      }
    );
  });
}

const craeteManifestFile = () => {
  const {
    NAME,
    VERSION,
    BUNDLE_ID,
    BUNDLE_VERSION,
    HOSTS,
    PANEL_WIDTH,
    PANEL_HEIGHT,
    ICON_NORMAL,
    ICON_ROLLOVER,
    ICON_DARK_NORMAL,
    ICON_DARK_ROLLOVER,
  } = cep.getSettings();

  const hosts = HOSTS.split(/(?![^)(]*\([^)(]*?\)\)),(?![^\[]*\])/)
    .map(host => host.trim())
    .map(host => {
      let [name, version] = host.split('@');

      if (version == '*' || !version) {
        version = '[0.0,99.9]';
      } else if (version) {
        version = version;
      }

      return {
        name,
        version,
      };
    });

  // write manifest.xml file
  const manifestContents = manifestTemplate({
    bundleName: NAME,
    bundleId: BUNDLE_ID,
    version: VERSION,
    hosts,
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
    bundleVersion: BUNDLE_VERSION,
    icon: {
      normal: ICON_NORMAL,
      rollover: ICON_ROLLOVER,
      darkNormal: ICON_DARK_NORMAL,
      darkRollover: ICON_DARK_ROLLOVER,
    },
  });
  
  if(!fs.existsSync(path.join(paths.appBuild, 'CSXS'))){
    fs.mkdirSync(path.join(paths.appBuild, 'CSXS'));
  }
  fs.writeFileSync(
    path.join(paths.appBuild, 'CSXS/manifest.xml'),
    manifestContents
  );
}

// Create the production build and print the deployment instructions.
function bin() {
  const filename = getOutputFilename();
  const outputPath = getOutputPath(filename);

  fs.removeSync(outputPath);
  craeteManifestFile();
  console.log('Signing and archiving...');
  console.log();
  fixZXPPermissions()
    .then(sign)
    .then(result => {
      console.log(`Created ${chalk.cyan(result.filename)}`);
      console.log();
    })
    .catch(error => console.error(error));
}

bin();
