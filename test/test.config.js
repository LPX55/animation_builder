const {
  gettextanimatorAppDataFolder
} = require("./../src/ipc/helpers/os-info");
const fs = require("fs-extra");
const path = require("path");
const rimraf = require("rimraf");

exports.backUpDataBeforeTest = () => {
  return new Promise(function(resolve) {
    const appFolder = gettextanimatorAppDataFolder();
    const testPath = `${path.dirname(appFolder)}/textanimatorTest`;
    fs.ensureDirSync(testPath);
    fs.copySync(appFolder, testPath);
    resolve();
  });
};

exports.restoreDataAfterTest = () => {
  return new Promise(function(resolve) {
    setTimeout(() => {
      const appFolder = gettextanimatorAppDataFolder();
      const testPath = `${path.dirname(appFolder)}/textanimatorTest`;
      rimraf(appFolder, () => {
        fs.ensureDirSync(appFolder);
        fs.copySync(testPath, appFolder);
        rimraf(testPath, () => {
          resolve();
        });
      });
    }, 1);
  });
};
