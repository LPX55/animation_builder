const { AutoUpdater } = require("./../src/ipc/events/updater");
const {
  gettextanimatorAppDataFolder,
  getNewVersionOfExtensionPath,
  currentPlatform,
  getOSUserInfo
} = require("./../src/ipc/helpers/os-info");
const {
  backUpDataBeforeTest,
  restoreDataAfterTest
} = require("./test.config.js");
const assert = require("assert");
const fs = require("fs-extra");
const { execSync } = require("child_process");
const request = require("request");
const branchName = require("current-git-branch");
const rimraf = require('rimraf');

const getMACRegistryCommands = () => {
  const command = [];
  const username = getOSUserInfo('username');
  command.push(
    `defaults read /Users/${
    username
    }/Library/Preferences/com.adobe.CSXS.5 PlayerDebugMode 1`
  );
  command.push(
    `defaults read /Users/${
    username
    }/Library/Preferences/com.adobe.CSXS.6 PlayerDebugMode 1`
  );
  command.push(
    `defaults read /Users/${
    username
    }/Library/Preferences/com.adobe.CSXS.7 PlayerDebugMode 1`
  );
  command.push(
    `defaults read /Users/${
    username
    }/Library/Preferences/com.adobe.CSXS.8 PlayerDebugMode 1`
  );
  command.push(
    `defaults read /Users/${
    username
    }/Library/Preferences/com.adobe.CSXS.9 PlayerDebugMode 1`
  );
  command.push(
    `defaults read /Users/${
    username
    }/Library/Preferences/com.adobe.CSXS.10 PlayerDebugMode 1`
  );
  return command;
};

const getWINRegistryCommands = () => {
  const command = [];
  command.push(
    "reg query HKEY_CURRENT_USER\\Software\\Adobe\\CSXS.5 /v PlayerDebugMode"
  );
  command.push(
    "reg query HKEY_CURRENT_USER\\Software\\Adobe\\CSXS.6 /v PlayerDebugMode"
  );
  command.push(
    "reg query HKEY_CURRENT_USER\\Software\\Adobe\\CSXS.7 /v PlayerDebugMode"
  );
  command.push(
    "reg query HKEY_CURRENT_USER\\Software\\Adobe\\CSXS.8 /v PlayerDebugMode"
  );
  command.push(
    "reg query HKEY_CURRENT_USER\\Software\\Adobe\\CSXS.9 /v PlayerDebugMode"
  );
  command.push(
    "reg query HKEY_CURRENT_USER\\Software\\Adobe\\CSXS.10 /v PlayerDebugMode"
  );
  return command;
};

describe("Auto Updater Tests", function () {
  this.timeout(0);
  before(done => {
    backUpDataBeforeTest().then(() => {
      done();
    });
  });

  after(done => {
    restoreDataAfterTest().then(() => {
      done();
    });
  });

  it("APP data folder should be exists and create on non exits", done => {
    const appFolder = gettextanimatorAppDataFolder();
    const Updater = new AutoUpdater("0.0.0");
    fs.removeSync(appFolder);
    Updater.createLocalFolder();
    assert.equal(fs.existsSync(appFolder), true);
    done();
  });

  it("Update folder should be exists and create on non exits", done => {
    const updateFolder = `${getNewVersionOfExtensionPath()}com.pixflow.test`;
    const Updater = new AutoUpdater("0.0.0");
    Updater.newVersionPath = updateFolder;
    fs.removeSync(updateFolder);
    Updater.createUpdateFolder();
    assert.equal(fs.existsSync(updateFolder), true);
    fs.removeSync(updateFolder);
    done();
  });

  it("Check registry data added correctly", done => {
    const Updater = new AutoUpdater("0.0.0");
    Updater.addRegistry();
    const getCommands =
      "MAC" === currentPlatform()
        ? getMACRegistryCommands()
        : getWINRegistryCommands();
    let commandResult = true;
    getCommands.forEach(command => {
      try {
        execSync(command).toString();
      } catch (error) {
        commandResult = false;
      }
    });
    assert(commandResult, true);
    done();
  });

  it("BackUp should work perfectly", done => {
    const Updater = new AutoUpdater("0.0.0");
    const updateFolderPath = `${getNewVersionOfExtensionPath()}com.pixflow.textanimator`;
    fs.ensureDirSync(updateFolderPath);
    Updater.backupOldVersion().then(() => {
      fs.access(
        `${Updater.rootUpdatePath}com.pixflow.textanimator.backup`,
        fs.constants.F_OK,
        err => {
          if (err) {
            done(err);
          } else {
            done();
          }
        }
      );
    });
  });

  it("Request option should be correct", done => {
    const Updater = new AutoUpdater("0.0.0");
    const options = {
      url: "http://pixflow.co/text-animator/update/update.php",
      method: "POST",
      headers: {
        "User-Agent": "Super Agent/0.0.1",
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Version-App": "0.0.0"
      }
    };
    assert.deepEqual(Updater.getRequestOptions(), options);
    done();
  });

  it("Update URL should response with status 200", done => {
    const Updater = new AutoUpdater("0.0.0");
    const options = {
      url: Updater.requestUpdateURL,
      method: "POST",
      headers: {
        "User-Agent": "Super Agent/0.0.1",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };
    request(options).on("response", response => {
      assert.equal(response.statusCode, 200);
      done();
    });
  });

  it("Should download update package perfectly", done => {
    if ("master" === branchName()) {
      const Updater = new AutoUpdater("0.0.0");
      const sendUpdateRequest = request(Updater.getRequestOptions());
      sendUpdateRequest
        .pipe(fs.createWriteStream(Updater.updatePath))
        .on("finish", () => {
          done();
        })
        .on("error", err => {
          done(err);
        });
    } else {
      done();
    }
  });

  it("Content of package should be correct", done => {
    if ("master" === branchName()) {
      const Updater = new AutoUpdater("0.0.0");
      Updater.processesDownloadFile().then(() => {
        fs.access(
          `${Updater.rootUpdatePath}updatePack`,
          fs.constants.F_OK,
          err => {
            if (err) {
              done(err);
            } else {
              done();
            }
          }
        );
      });
    } else {
      done();
    }
  });

  it("Updated packaged should installed completely", done => {
    if ("master" === branchName()) {
      const Updater = new AutoUpdater("0.0.0");
      Updater.processesUnpackFile().then(() => {
        assert.equal(
          fs.existsSync(`${Updater.newVersionPath}com.pixflow.textanimator`),
          true
        );
        done();
      });
    } else {
      done();
    }
  });

  context("WorkSpace should be clear completely", function () {
    it("#Update pack", done => {
      if ("master" === branchName()) {
        const Updater = new AutoUpdater("0.0.0");
        assert.equal(
          fs.existsSync(`${Updater.rootUpdatePath}updatePack`),
          false
        );
        done();
      } else {
        done();
      }
    });

    it("#ZIP file", done => {
      if ("master" === branchName()) {
        const Updater = new AutoUpdater("0.0.0");
        assert.equal(
          fs.existsSync(`${Updater.rootUpdatePath}update.zip`),
          false
        );
        done();
      } else {
        done();
      }
    });
  });
});
