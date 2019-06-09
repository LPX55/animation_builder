const branchName = require("current-git-branch");
const { exec } = require("child_process");
const glob = require("glob");
const fs = require("fs");
const AdmZip = require('adm-zip');
const zipFolder = require('folder-zip-sync');

module.exports = (that, done, grunt) => {
  if (fs.existsSync('update/update.zip')) {
    const modifedTime = fs.statSync('update/update.zip');
    const now = new Date().getTime();
    const endTime = new Date(modifedTime.mtime).getTime();
    if ((now - endTime) < 60000) {
      done();
      return;
    }
  }
  const rimraf = require("fs-extra");
  if (rimraf.existsSync("./staging")) {
    rimraf.removeSync("./staging");
  }
  if (rimraf.existsSync("./update")) {
    rimraf.removeSync("./update");
  }
  grunt.log.write("Create update file...").ok();
  const ZXPPath = glob.sync("./archive/*.zxp");
  const zip = new AdmZip(ZXPPath[0]);
  rimraf.ensureDirSync("./update/pack/com.pixflow.motionfactory");
  zip.extractAllTo("./update/pack/com.pixflow.motionfactory", true);
  zipFolder('./update/pack', './update/newVersion.zxp');
  rimraf.removeSync('./update/pack/com.pixflow.motionfactory');
  rimraf.ensureDirSync("./update/pack/updatePack");
  fs.renameSync('./update/newVersion.zxp', './update/pack/updatePack/newVersion.zxp');
  if (fs.existsSync('./src/patch.js')) {
    fs.renameSync('./src/patch.js', './update/pack/updatePack/patch.js');
    grunt.log.write("Create Patch...").ok();
  } else {
    grunt.log.write("No patch detected...").ok();
  }
  zipFolder('./update/pack', './update/update.zip');
  rimraf.removeSync('./update/pack');

  done();


};