'use strict';

const path = require('path');
const fs = require('fs');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  appPath: appDirectory,
  dotenv: resolveApp('.env'),
  appBuild: resolveApp('build'),
  appPackageJson: resolveApp('package.json'),
  appArchive: resolveApp('archive'),
};
