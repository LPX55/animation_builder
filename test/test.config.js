const {
  getMotionFactoryAppDataFolder
} = require("./../src/ipc/helpers/os-info");
const fs = require("fs-extra");
const path = require("path");
const rimraf = require("rimraf");

exports.backUpDataBeforeTest = () => {
  return new Promise(function(resolve) {
    const appFolder = getMotionFactoryAppDataFolder();
    const testPath = `${path.dirname(appFolder)}/MotionFactoryTest`;
    fs.ensureDirSync(testPath);
    fs.copySync(appFolder, testPath);
    resolve();
  });
};

exports.restoreDataAfterTest = () => {
  return new Promise(function(resolve) {
    setTimeout(() => {
      const appFolder = getMotionFactoryAppDataFolder();
      const testPath = `${path.dirname(appFolder)}/MotionFactoryTest`;
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
